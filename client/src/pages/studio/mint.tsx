'use client';

import { CustomConnectButton } from '@/components/CustomConnectButton';
import Loading from '@/components/Loading';
import Traits from '@/components/Traits';
import UploadImage from '@/components/UploadImage';
import { useAccount } from '@/hooks/useAccount';
import { uploadWeb3Storage, web3StorageLink } from '@/services/web3Storage';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Mint() {
  const [image, setImage] = useState<File | null>(null);
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState<any>();
  const [name, setName] = useState('');
  const [tokenId, setTokenId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [traits, setTraits] = useState<any>([])
  const [status, setStatus] = useState(0)
  const { account, address } = useAccount();
  const router = useRouter();

  const uploadNFTData = async ({image, metadata}:any) => {
    const body = {
      contractAddress: collection.contractAddress,
      token: {
        id: tokenId,
        name,
        image,
        description,
        traits,
        externalLink,
        metadata,
        isClaimed: false,
      }
    }
    const bgResponse = await fetch('/api/nft', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log(bgResponse.status)
  }

  useEffect(() => {
    const getUserCollection = async (address: `0x${string}`) => {
      const bgResponse = await fetch(`/api/collections?creator=${address}`);
      const response = await bgResponse.json()
      setCollections(response.collections)
    }

    if(address) getUserCollection(address)
  }, [address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic, e.g., sending data to a server
    setStatus(1) // start upload
    const imageCid = await uploadWeb3Storage(image)
    const metadata = {
      token: {
        id: tokenId,
        name,
        image: web3StorageLink(imageCid),
        description,
        traits,
        externalLink,
      }
    }
    const stringData = JSON.stringify(metadata)
    const files = new File([stringData], "metadata.json")
    const cid = await uploadWeb3Storage(files)
    setStatus(2) // set contract
    await uploadNFTData({
      image: web3StorageLink(imageCid),
      metadata: web3StorageLink(cid),
    })
    setStatus(0)
  };

  const handleCollection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === 'Create new Collection') {
      router.push('/studio/deploy-contract'); // Redirect nếu chọn "Create new Collection"
    } else {
      const selectedObject = JSON.parse(selectedValue);
      setCollection(selectedObject)
    }
  };

  return (
    <div className="min-h-main mt-8 flex items-center justify-center">
      <Loading state={status}/>
      <div className="container mx-auto px-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 text-start mb-4">
          Create an NFT
        </h1>
        <p className='mb-4'>
          Once your item is minted you will not be able to change any of its information.
        </p>

        <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="h-96 w-full">
            <UploadImage size="big" setFile={setImage}/>
          </div>

          <div>
            <div className="mb-4">
              <label htmlFor="collection" className="block text-gray-700 font-semibold mb-2">
                Collection *
              </label>
              <select defaultValue="Select Collection" className="select w-full border border-gray-300" onChange={handleCollection}>
                <option disabled={true}>Select Collection</option>
                {collections.map((value:any,index) => (
                  <option key={index} value={JSON.stringify(value)}>{value.name}</option>
                ))}
                <option>
                  <Link href={'/studio/deploy-contract'}>
                    Create new Collection
                  </Link>
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter NFT name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                TokenID *
              </label>
              <input
                type="number"
                id="name"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={tokenId}
                onChange={(e) => setTokenId(Number(e.target.value))}
                placeholder="Enter contract name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="symbol" className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                id="symbol"
                className="textarea h-28 block w-full text-gray-700 border border-gray-300 p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="symbol" className="block text-gray-700 font-semibold mb-2">
                External link
              </label>
              <input
                type="text"
                id="symbol"
                className="input input-bordered block w-full text-gray-700 border border-gray-300 p-2"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="Enter external link"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="symbol" className="block text-gray-700 font-semibold mb-2">
                Traits
              </label>
              <Traits setData={setTraits}/>
            </div>

            {address ?
              <button
                type="submit"
                className="w-full btn btn-primary text-white py-2 px-4 rounded-full transition"
              >
                Mint
              </button>
              :
              <CustomConnectButton/>
            }
            </div>
        </form>
      </div>
    </div>
  );
};