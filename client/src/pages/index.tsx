import Layout from '@/components/layout/Layout';

import Link from 'next/link';
import { useAccount } from '@starknet-react/core';
import { CustomConnectButton } from '@/components/CustomConnectButton';

export default function HomePage() {
  const {address} = useAccount()
  return (
    <Layout>
      <div className="flex items-center justify-center mt-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 items-center">
            {/* Feature 1 */}
            <div className="p-6 h-52 transform border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-1 flex items-center justify-center">
              <img src='./imgs/nftstarter-logo.png' className='w-40 h-40 rounded-full'/>
            </div>

            <div className="p-6 h-52 flex items-center transform border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-1">
              <h2 className="text-5xl font-bold text-center">NFTStarter</h2>
            </div>

            {/* Feature 2 */}
            <div className="relative px-6 pt-6 h-52 transform border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-2">
              <h2 className="font-semibold mb-4 text-3xl">Lazy mint NFT on </h2>
              <h2 className="font-semibold mb-4 text-3xl text-secondary">Startnet</h2>
              <div className='flex justify-end h-full w-full absolute top-[-40px]'>
                <div className='h-60 w-72 bg-cover' style={{ backgroundImage : `url('./imgs/mint.png')`}} />
              </div>
            </div>

            <div className="h-52 transform border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-1">
              <div className='h-full w-full bg-cover bg-center' style={{ backgroundImage : `url('./imgs/man.png')`}} />
            </div>

            {/* Central Feature */}
            <div className="p-8 h-full transform border-base-content/20 hover:border-base-content/40 border row-span-2 col-span-2">
              <h2 className="text-2xl font-semibold text-purple-600 mb-4">Explore Our App Features 🎉🎉🎉</h2>
              <div className='h-full flex items-center'>
                {address ?
                  <Link href={`/studio/create`}>
                    <button className="btn btn-primary w-36">Start mint</button>
                  </Link>
                :
                  <CustomConnectButton />
                }
              </div>
            </div>

            {/* Feature 3 */}
            <div className="transform h-52 border-base-content/20 hover:border-base-content/40 border bg-black row-span-1 col-span-1 relative">
              <div className='absolute z-0 top-0 h-full w-full bg-cover bg-center' style={{ backgroundImage : `url('./imgs/the-creation-adam.png')`}} />
              <div className='absolute p-8 h-full w-full flex flex-col justify-between gap-8'>
                <h1 className="bottom-0 z-10 text-2xl font-bold text-left text-primary">Bridge NFT</h1>
                <Link href={`/bridge`}>
                  <button className="btn btn-secondary w-36">Bridge</button>
                </Link>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="ransform h-52 border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-2">
              <div className='h-full w-full bg-cover bg-center' style={{ backgroundImage : `url('/imgs/starknet-big.png')`}} />
            </div>

            <div className="p-6 transform h-full border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-1">
              <h2 className="text-2xl font-semibold text-purple-600 mb-4">Explore NFT 🎉🎉🎉</h2>
              <div className='h-full flex items-center'>
              </div>
            </div>

            <div className="transform h-full border-base-content/20 hover:border-base-content/40 border row-span-1 col-span-1">
              <div className='h-full w-full bg-cover bg-center' style={{ backgroundImage : `url('/imgs/studio-create.png')`}} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
