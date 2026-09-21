'use client';

import { CustomConnectButton } from '@/components/CustomConnectButton';
import Loading from '@/components/Loading';
import SimpleLoading from '@/components/SimpleLoading';
import { useAccount } from '@/hooks/useAccount';
import { uploadWeb3Storage, web3StorageLink } from '@/services/web3Storage';
import { shortenAddress } from '@/utils/string';
import { useContract, useSendTransaction, useTransactionReceipt, useUniversalDeployerContract } from '@starknet-react/core';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Abi } from "starknet";
import { stringToHex } from 'viem';

const abi = [
  {
    type: "function",
    name: "lazy_mint",
    state_mutability: "external",
    inputs: [
      {
        name: "to",
        type: "core::starknet::contract_address::ContractAddress"
      },
      {
        name: "uri",
        type: "core::byte_array::ByteArray"
      },
      {
        name: "token_id",
        type: "core::integer::u256"
      },
      {
        name: "msg_hash",
        type: "core::felt252"
      },
      {
        name: "signature",
        type: "core::array::Span::<core::felt252>"
      }
    ],
    outputs: []
  },
] as const satisfies Abi;

export default function Mint() {
  const [nft, setNft] = useState<any>()
  const [status, setStatus] = useState(0)
  const { address } = useAccount();
  const router = useRouter()
  const { collection, tokenid } = router.query;
  const encoder = new TextEncoder();

  useEffect(() => {
    const getNFT = async (collection: string) => {
      const bgResponse = await fetch(`/api/nft?contractAddress=${collection}&tokenId=${tokenid}`);
      const response = await bgResponse.json()
      setNft(response.token)
    }

    if(collection) getNFT(collection as string)
  }, [collection])

  const { contract } = useContract({
    abi: abi,
    address: collection ? collection as `0x${string}` : "0x",
  });

  const { sendAsync, data, error } = useSendTransaction({
    calls:
      contract && address && nft
        ? [contract.populate("lazy_mint", [address, '0x68747470733a2f2f73616c2e766e2f47613561734a' , nft.id, nft.msg_hash, nft.signature])]
        : undefined,
  });

  useEffect(() => {
    if(data?.transaction_hash) {
      toast.success(`Mint successfully hash : ${data?.transaction_hash}`)
    }
  }, [data?.transaction_hash])

  const handleSubmit = async () => {
    setStatus(1)
    await sendAsync()
    setStatus(0)
  };

  return (
    <div className="min-h-main flex items-center justify-center">
      <SimpleLoading state={status} description='Minting'/>
      <div className="container mx-auto px-4 max-w-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Claim your NFT
        </h1>
        <div className="card bg-base-100 w-96 shadow-xl mb-8">
          <figure className='h-80'>
            {nft ? <img
              src={`${nft.image}`}
              alt="Shoes"
              className='h-full w-full object-contain' /> :
              <div className='skeleton w-full h-full'></div>
            }
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              {nft ? nft.name : <div className='skeleton w-36 h-8'/>}
            </h2>
            <p>{nft ? nft.description : <div className='skeleton w-full h-20'></div>}</p>
            <div className="card-actions justify-between">
              <div>{collection && shortenAddress(collection as string)}</div>
              <div className="badge badge-outline">{nft ? nft.id : <div className='skeleton w-10 h-3'/>}</div>
            </div>
          </div>
        </div>
        { address ?
          <div className='w-96' onClick={() => handleSubmit()}>
            <button className='btn btn-primary w-full'>Claim</button>
          </div>
          :
          <CustomConnectButton/>
        }
      </div>
    </div>
  );
};
