'use client';

import Loading from '@/components/Loading';
import UploadImage from '@/components/UploadImage';
import { uploadWeb3Storage, web3StorageLink } from "@/services/web3Storage"
import { useEffect, useState } from 'react';
import { useAccount, useSendTransaction, useTransactionReceipt, useUniversalDeployerContract } from '@starknet-react/core';
import { Collections } from '@/interfaces/Collections'
import classhash from '../../../../contracts/cairo/config/config.json'
import { CustomConnectButton } from '@/components/CustomConnectButton';
import { toast } from 'react-toastify';

export default function DeployContract() {
    const [image, setImage] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [status, setStatus] = useState(0)
    const [cid, setCid] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const { udc } = useUniversalDeployerContract();
    const { account, address } = useAccount();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus(1) // start upload
      const cid = await uploadWeb3Storage(image)
      setCid(web3StorageLink(cid))
      setStatus(2) // set contract
      sendAsync()
      // await uploadContractData("")
    };

    const uploadContractData = async (cid:any, contractAddress:any) => {
      const body: Collections = {
        creator: address as string,
        image: cid,
        name: name,
        symbol: symbol,
        contractAddress
      }
      const bgResponse = await fetch('/api/collections', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      console.log(bgResponse)
    }

    const { sendAsync, isPending, error, data } = useSendTransaction({
      calls:
        udc && address && name !== '' && symbol !== ''
          ? [
              udc.populate("deploy_contract", [
                classhash.class_hash,
                2, // salt
                false, // fromZero
                [name, name.length, symbol, symbol.length, process.env.NEXT_PUBLIC_LAZY_MINT_PUBLIC_KEY],
              ]),
            ]
          : undefined,
    });

    const { data: trxdata } = useTransactionReceipt({
      hash: data?.transaction_hash,
    }) as any;

    useEffect(() => {
      const uploadData = async (cid:any, contractAddress:any) => {
        await uploadContractData(cid, contractAddress)
        toast.success(`Deploy contract successfully: ${contractAddress}`)
        setStatus(0)
      }
      if(trxdata && trxdata.events[0] && status === 2) {
        uploadData(cid, trxdata.events[0].data[0])
      }
    }, [trxdata])

    return (
      <div className="min-h-main flex items-center justify-center">
        <Loading state={status}/>
        {/* <button onClick={()=> getPublickey()}>Test</button> */}
        <div className="container mx-auto px-4 max-w-lg">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
            Let's create a smart contract for your drop.
          </h1>
          <p className='mb-4'>You will need to deploy an ERC-721 contract onto the blockchain before you can create a drop.</p>

          <form className="p-6 rounded-lg" onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="mb-10">
              <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                Upload logo Image
              </label>
              <UploadImage setFile={setImage}/>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Contract Name
              </label>
              <input
                type="text"
                id="name"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter contract name"
              />
            </div>

            {/* Symbol Input */}
            <div className="mb-4">
              <label htmlFor="symbol" className="block text-gray-700 font-semibold mb-2">
                Contract Symbol
              </label>
              <input
                type="text"
                id="symbol"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter contract symbol"
              />
            </div>

            {/* Submit Button */}
            {
              address ?
                <button
                  type="submit"
                  className="w-full btn btn-primary text-white py-2 px-4 rounded-full transition"
                >
                  Create
                </button> :
                <div className='w-full items-center'>
                  <CustomConnectButton/>
                </div>
            }
          </form>
        </div>
      </div>
    );
  };