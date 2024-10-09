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
    <div className="container mx-auto px-4">
      <Head>
        <title>Video to Article Converter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-20">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Video to Article Converter
        </h1>
        
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