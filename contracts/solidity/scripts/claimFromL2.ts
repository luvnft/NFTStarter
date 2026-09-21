import { ethers, getAddress, Wallet, parseEther } from 'ethers'
import {abi as ERC721ABI } from '../artifacts/contracts/NFTStarter.sol/NFTStarter.json'
import {abi as BridgeABI } from '../artifacts/contracts/NFTBridgeEthereum.sol/NFTBridgeEthereum.json';

import 'dotenv/config';

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const BridgeAddress = process.env.NFT_BRIDGE_ADDRESS as `0x${string}`;
    const nftAddress = process.env.NFT_ADDRESS as `0x${string}`;
    const selector = process.env.L2_SELECTOR_STRUCT as `0x${string}`;
    const l2Address = process.env.L2_CONTRACT_ADDRESS as `0x${string}`;
    const l2receiver = process.env.L2_RECEIVER_ADDRESS as `0x${string}`;

    const signer = new Wallet(process.env.ACCOUNT_PRIVATE_KEY as `0x${string}`, provider);

    const bridge = new ethers.Contract(BridgeAddress, BridgeABI, signer);

    let tokenID = 2;

    const tx = await bridge.consumeMessage(nftAddress, l2Address, ['0x19171a5da52276b6a034CB859ddA1e905739F8B2', tokenID], { gasLimit: 1000000n });
    console.log(tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })