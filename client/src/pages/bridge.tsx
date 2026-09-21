'use client';

import { CustomConnectButton } from '@/components/CustomConnectButton';
import NFTImage from '@/components/NFTimage';
import LayerOneProviders from '@/components/Providers/layerOneProvider';
import { useAccount as useAccountLayerTwo } from '@/hooks/useAccount';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMemo, useState } from 'react';
import { useAccount as useAccountLayerOne, useReadContracts, useWriteContract } from 'wagmi';
import NFTBridgeEthereumAbi from '@/constant/NFTBridgeEthereum.json';
import { BRIDGE_CONTRACT } from '@/utils/constants';
import { erc721Abi } from 'viem';

export default function Bridge() {
  return <LayerOneProviders>
    <UI/>
  </LayerOneProviders>
}

function UI() {
  const [collection, setCollection] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const { address: layerOneAddress } = useAccountLayerOne()
  const { address: layerTwoAddress } = useAccountLayerTwo()
  const { writeContract } = useWriteContract()
  const [from, setFrom] = useState({
    name: "Ethereum",
    image: "/svg/ethereum.svg"
  });
  const [to, setTo] = useState({
    name: "Statknet",
    image: "/svg/starknet.svg"
  });

  const swapStates = () => {
    setFrom((prev) => ({ ...to }));
    setTo((prev) => ({ ...from }));
  };

  const bridgeNFT = () => {
    if (from.name === "Ethereum") {
      const data = writeContract({
        abi: NFTBridgeEthereumAbi.abi as any,
        address: BRIDGE_CONTRACT,
        functionName: 'lockNFT',
        args: [
          collection,
          tokenId,
          "0x00f1149cade9d692862ad41df96b108aa2c20af34f640457e781d166c98dc6b0",
          "0x042efc59b4275b411038063887faff13c47ccdd99738181b9c9ec399a4b4eec8",
          recipientAddress
        ],
        value: 100000000000000n
      })
      console.log(data)
    };
  }

  // Read token
  const { data: token } = useReadContracts({
    contracts: [
      {
        address: collection as `0x${string}`,
        abi: erc721Abi as any,
        functionName: 'name',
      },
      {
        address: collection as `0x${string}`,
        abi: erc721Abi as any,
        functionName: 'tokenURI',
        args: [tokenId],
      },
      {
        address: collection as `0x${string}`,
        abi: erc721Abi as any,
        functionName: 'ownerOf',
        args: [tokenId as any],
      },
      {
        address: collection as `0x${string}`,
        abi: erc721Abi as any,
        functionName: 'getApproved',
        args: [tokenId as any],
      }
    ],
  });

  const approveNFT = async () => {
    const data = writeContract({
      abi: erc721Abi as any,
      address: collection as `0x${string}`,
      functionName: 'approve',
      args: [
        BRIDGE_CONTRACT,
        tokenId,
      ],
    })
    console.log(data)
  }

  const isApprove = useMemo(() => {
    if (
      token &&
      token[3].result &&
      (token[3].result.toString().toLocaleLowerCase() as any) ===
        BRIDGE_CONTRACT.toLocaleLowerCase()
    )
      return true;
    else false;
  }, [token]);

  console.log(token,isApprove)

  return (
    <div className="min-h-main mt-8 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 text-start mb-4">
          NFT Bridges
        </h1>
        <p className='mb-4'>
          Easy to transfer NFTs Across Starknet and Ethereum.
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* Image Upload */}
          <div className="h-96 w-full col-span-2 flex items-center justify-center">
            <NFTImage token={token}/>
          </div>

          <div>
            <div className="mb-4">
              <label htmlFor="collection" className="block text-gray-700 font-semibold mb-2">
                From *
              </label>
              <div className='flex gap-2 border rounded-full items-center p-2 '>
                <img src={`${from.image}`} className='w-10 h-10 rounded-full'/>
                <p>{from.name}</p>
              </div>
            </div>

            <div className='flex justify-center'>
              <button className="btn btn-circle btn-secondary"
                onClick={() => swapStates()}
              >
                <ArrowsUpDownIcon className='h-6 w-6'/>
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="collection" className="block text-gray-700 font-semibold mb-2">
                To *
              </label>
              <div className='flex gap-2 border rounded-full items-center p-2'>
                <img src={`${to.image}`} className='w-10 h-10 rounded-full'/>
                <p>{to.name}</p>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="collection" className="block text-gray-700 font-semibold mb-2">
                Collection *
              </label>
              <input
                type="text"
                id="collection"
                className="input input-bordered block w-full text-gray-700 border border-gray-300"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                placeholder="Enter contract address: 0x"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Token Id *
              </label>
              <input
                type="text"
                id="name"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token id: 1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="symbol" className="block text-gray-700 font-semibold mb-2">
                Recipient address *
              </label>
              <input
                type="text"
                id="name"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter recipient address: 0x"
              />
            </div>

            {
              from.name === 'Statknet' ?
                layerTwoAddress ? <button
                    type="submit"
                    className="w-full btn btn-primary text-white py-2 px-4 rounded-full transition"
                  >
                    Bridge
                  </button>:
                  <CustomConnectButton/>
                : layerOneAddress ?
                  isApprove ?<button
                    onClick={() => bridgeNFT()}
                    className="w-full btn btn-primary text-white py-2 px-4 rounded-full transition"
                  >
                    Bridge
                  </button> : <button
                    onClick={() => approveNFT()}
                    className="w-full btn btn-primary text-white py-2 px-4 rounded-full transition"
                  >
                    Approve
                  </button> :
                  <ConnectButton/>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
