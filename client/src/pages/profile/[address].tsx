'use client';

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { useAccount } from '@/hooks/useAccount';
import { BlockieAvatar } from '@/components/BlockieAvatar';
import Collections from '@/components/Collections';
import NFTs from '@/components/NFTs';

export default function Profile() {
  const router = useRouter();
  const { address } = router.query;
  const tabs = ['Collections', 'NFTs'];
  const account = useAccount();
  const [collections, setCollections] = useState([])

  const [currentTab, setCurrentTab] = useState<number>(0);

  // const isProfile = useMemo(() => {
  //   if (!address || !account) {
  //     return false;
  //   }
  //   return (
  //     String(address).toLowerCase() === String(account.address).toLowerCase()
  //   );
  // }, [address, account.address]);

  useEffect(() => {
    const getUserCollection = async (address: `0x${string}`) => {
      const bgResponse = await fetch(`/api/collections?creator=${address}`);
      const response = await bgResponse.json()
      setCollections(response.collections)
    }

    if(address) getUserCollection(address as `0x${string}`)
  }, [address])

  return (
    <Layout>
      <div className='container mx-auto conflex py-8 justify-between'>
        {address && (
          <div className="ring-primary ring-offset-base-100 w-40 rounded-full ring ring-offset-2">
            <BlockieAvatar address={address as string} size={160} ensImage={""} />
          </div>
        )}
      </div>
      <div role='tablist' className='container mx-auto tabs tabs-lifted tabs-lg flex'>
        {tabs.map((tab, index) => (
          <h1
            key={index}
            role='tab'
            className={`tab text-gray-500 ${
              currentTab === index && 'tab-active'
            }`}
            onClick={() => setCurrentTab(index)}
          >
            {tab}
          </h1>
        ))}
        <div className='border-b w-full'></div>
      </div>
      <div className='container mx-auto py-8'>
        {currentTab === 0 ? (
          collections ? <Collections collections={collections}/> : <div className="card skeleton h-96 w-full bg-base-100 shadow-xl"/>
        ) : (
          collections ? <NFTs collections={collections}/> : <div className="card skeleton h-96 w-full bg-base-100 shadow-xl"/>
        )}
      </div>
    </Layout>
  );
}