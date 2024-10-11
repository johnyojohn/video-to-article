import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import ArticleViewer from '../components/ArticleViewer';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ArticlePage: React.FC = () => {
  const router = useRouter();
  const [articleData, setArticleData] = useState<any>(null);

  useEffect(() => {
    if (router.query.data) {
      setArticleData(JSON.parse(router.query.data as string));
    }
  }, [router.query]);

  return (
    <div className="w-full overflow-hidden">
      <Head>
        <title>Article Viewer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-5xl font-bold py-10 mb-10 text-center bg-green-700 text-white">
        <Link href="/">
          TextualLearner
        </Link>
      </h1>
      <main className="">
        {articleData ? (
          <ArticleViewer articleData={articleData} />
        ) : (
          <p>Loading article data...</p>
        )}
      </main>
    </div>
  );
};

export default ArticlePage;