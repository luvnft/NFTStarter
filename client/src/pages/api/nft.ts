import { connectToDatabase } from "@/services/mongodb";
import { generateRandomHex, stringToBigNumberishArray } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from 'next'
import { ec, WeierstrassSignatureType } from 'starknet';

const { db } = await connectToDatabase();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'POST') {
    try {
      try {
        const data = JSON.parse(req.body)
        const msg_hash = `0x${generateRandomHex(10)}`
        const signature: WeierstrassSignatureType = ec.starkCurve.sign(msg_hash, process.env.LAZY_MINT_PRIVATE_KEY as string);

        data.token.msg_hash = msg_hash
        data.token.signature = [signature.r.toString(),signature.s.toString()]
        const result = await db.collection("collections").updateOne(
          {
            contractAddress: data.contractAddress ,
            "tokens.id": data.token.id
          },
          {
            $set: { "tokens.$": data.token, updatedAt: new Date() }
          }
        );
        if (result.matchedCount === 0) {
          const addResult = await db.collection("collections").updateOne(
            { contractAddress: data.contractAddress },
            {
              $push: { tokens: data.token },
              $set: { updatedAt: new Date() }
            }
          );

          if (addResult.matchedCount === 0) {
            return res.status(404).json({ message: "Collection not found" });
          }
          return res.status(200).json({ message: "Token added successfully", addResult });
        }

        res.status(200).json({ message: "Token updated successfully", result });
      } catch (error) {
        console.error('Error adding project:', error);
        return res.status(500).json({ error: 'Failed to add project' })
      }
    } catch (err:any) {
      return res.status(500).json({ message: err.message })
    }
  } else if (req.method === 'GET') {
    try {
      const { contractAddress, tokenId } = req.query;

      try {
        const collection = await db.collection("collections").findOne(
          { contractAddress, "tokens.id": parseInt(tokenId as string) },
          { projection: { "tokens.$": 1 } }
        );

        if (!collection || !collection.tokens || collection.tokens.length === 0) {
          return res.status(404).json({ message: "Token not found" });
        }
        res.status(200).json({ token: collection.tokens[0] });

      } catch (error) {
        console.error('Error getting project:', error);
        return res.status(500).json({ error: 'Failed to get project' })
      }
    } catch (err:any) {
      return res.status(500).json({ message: err.message })
    }
  } else {
    // Handle any other HTTP method
  }
}
