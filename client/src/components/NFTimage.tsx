import { useEffect, useState } from 'react';

export default function NFTImage({ token }: { token: any }) {
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async (url: string) => {
      try {
        const response = await fetch(url);
        const metadata = await response.json()
        setTokenInfo(metadata);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (token && token[1].result) fetchData(token[1].result as any);
  }, [token]);

  return (
    <div className='h-40 w-96 flex justify-center items-center'>
      {token && token[1].result && tokenInfo && tokenInfo.image ? (
        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img
              className='h-40 object-cover'
              src={tokenInfo.image}
              alt='nft image'
              />
          </figure>
          <div className="card-body">
            <h2 className="card-title">{tokenInfo.name}</h2>
            <p className='h-24 overflow-hidden' >{tokenInfo.description}</p>
          </div>
        </div>
      ) : (
        <div className='skeleton h-96 w-full'></div>
      )}
    </div>
  );
}
