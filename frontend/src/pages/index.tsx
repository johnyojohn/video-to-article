import React, { useState } from 'react';
import Head from 'next/head';
import VideoUploader from '../components/VideoUploader';
import ArticleViewer from '../components/ArticleViewer';

const Home: React.FC = () => {
  const [articleData, setArticleData] = useState<any>(null);

  const handleVideoUploaded = (data: any) => {
    setArticleData(data);
  };

  return (
    <div className="w-full overflow-hidden">
      <Head>
        <title>Video to Article Converter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-5xl font-bold py-10 mb-10 text-center bg-green-700 text-white">
          TextualLearner
      </h1>
      <main className="">
        
        {!articleData ? (
          <VideoUploader onVideoUploaded={handleVideoUploaded} />
        ) : (
          <ArticleViewer articleData={articleData} />
        )}
      </main>
    </div>
  );
};

export default Home;