import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useGetVideoUrl } from '@/lib/hooks/useGetVideoUrl';

interface ArticleViewerProps {
  articleData: {
    title: string;
    content: string;
    videoName: string;
  };
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ articleData }) => {
  const [processedContent, setProcessedContent] = useState(articleData.content);
  const [videoUrl, setVideoUrl] = useState('');
  const getVideoUrl = useGetVideoUrl();

  useEffect(() => {
    processMarkdown(articleData.content, articleData.videoName);
  }, [articleData.content, articleData.videoName]);

  const processMarkdown = async (content: string, videoName: string) => {
    const regex = /<!---<img timestamp="((?:\d{1,2}:)?\d{2}:\d{2})" width="(\d+)" height="(\d+)" \/>-->/g;
    let match;
    let processedContent = content;

    const videoUrl = await getVideoUrl(videoName);
    if (videoUrl) {
      setVideoUrl(videoUrl);
    } else {
      console.error('Failed to fetch video url');
    }

    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, timestamp, width, height] = match;
      const imageUrl = await getVideoFrameUrl(videoName, timestamp);
      const imageTag = `<img src="${imageUrl}" width="${width}" height="${height}" alt="Video frame at ${timestamp}" />`;
      processedContent = processedContent.replace(fullMatch, imageTag);
    }

    setProcessedContent(processedContent);
  };

  const getVideoFrameUrl = async (videoName: string, timestamp: string): Promise<string> => {
    const response = await fetch(`/api/get-video-frame?videoName=${encodeURIComponent(videoName)}&timestamp=${encodeURIComponent(timestamp)}`);
    return response.url;
  };

  // const getVideoUrl = async (videoName: string): Promise<string> => {
  //   const response = await fetch(`/api/get-video-url?file=${encodeURIComponent(videoName)}`);
  //   if (!response.ok) {
  //     console.error('Failed to fetch video frame');
  //     return '/error-image.jpg';
  //   }
    
  //   const blob = await response.blob();
  //   return URL.createObjectURL(blob);
  // };

  return (
    <div className="max-w-3xl mx-auto">
      <video className="mb-10" src={videoUrl} controls />

      <ReactMarkdown className="markdown">{processedContent}</ReactMarkdown>

      {/* <h2 className="text-2xl font-bold mb-4">{articleData.title}</h2>
      
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
      </div> */}
    </div>
  );
};

export default ArticleViewer;