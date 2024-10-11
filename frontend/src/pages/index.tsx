import React from 'react';
import Head from 'next/head';
import VideoUploader from '../components/VideoUploader';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const router = useRouter();

  const handleVideoUploaded = (data: any) => {
    // Navigate to the article page with the data as query parameters
    router.push({
      pathname: '/article',
      query: { data: JSON.stringify(data) },
    });
  };

  return (
    <div className="w-full overflow-hidden">
      <Head>
        <title>Video to Article Converter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-5xl font-bold py-10 mb-10 text-center bg-green-700 text-white">
        <Link href="/">
          TextualLearner
        </Link>
      </h1>
      <main className="">
        <VideoUploader onVideoUploaded={handleVideoUploaded} />
      </main>
    </div>
  );
};

export default Home;