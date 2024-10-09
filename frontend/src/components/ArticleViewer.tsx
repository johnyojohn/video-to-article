import React from 'react';

interface TableOfContentsItem {
  title: string;
  timestamp: number;
}

interface ArticleViewerProps {
  articleData: {
    title: string;
    content: string;
    tableOfContents: TableOfContentsItem[];
  };
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ articleData }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{articleData.title}</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Table of Contents</h3>
        <ul className="list-disc list-inside">
          {articleData.tableOfContents.map((item, index) => (
            <li key={index} className="mb-1">
              <a href={`#section-${index}`} className="text-blue-600 hover:underline">
                {item.title} - {formatTime(item.timestamp)}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="prose max-w-none">
        {articleData.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default ArticleViewer;