import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useGetVideoUrl } from '@/lib/hooks/useGetVideoUrl';
import rehypeRaw from "rehype-raw";

interface ArticleViewerProps {
  articleData: {
    title: string;
    content: string;
    videoName: string;
  };
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ articleData }) => {
  const [processedContent, setProcessedContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const getVideoUrl = useGetVideoUrl();

  useEffect(() => {
    processMarkdown(articleData.content, articleData.videoName);
  }, [articleData.content, articleData.videoName]);

  const processMarkdown = async (content: string, videoName: string) => {
    setIsLoading(true);
    const regex = /<!---<img timestamp="((?:\d{1,2}:)?\d{2}:\d{2})" width="(\d+)" height="(\d+)" \/>-->/g;
    let match;
    let processedContent = content;

    const videoUrl = await getVideoUrl(videoName);
    if (videoUrl) {
      setVideoUrl(videoUrl);
    } else {
      console.error('Failed to fetch video url');
    }

    const matches = content.match(regex);
    if (matches) {
      for (const fullMatch of matches) {
        const [, timestamp, width, height] = fullMatch.match(/timestamp="((?:\d{1,2}:)?\d{2}:\d{2})" width="(\d+)" height="(\d+)"/) || [];
        if (timestamp && width && height) {
          const imageUrl = await getVideoFrameUrl(videoName, timestamp);
          console.log(imageUrl);
          
          const aspectRatio = parseInt(height) / parseInt(width);
          const imageTag = `<img src="${imageUrl}" style="width: 32rem; height: auto; aspect-ratio: ${1/aspectRatio};" alt="Video frame at ${timestamp}" />`;
          processedContent = processedContent.replace(fullMatch, imageTag);
        }
      }
    }

    setProcessedContent(processedContent);
    setIsLoading(false);
  };

  const getVideoFrameUrl = async (videoName: string, timestamp: string): Promise<string> => {
    const response = await fetch(`/api/get-video-frame?videoName=${encodeURIComponent(videoName)}&timestamp=${encodeURIComponent(timestamp)}`);
    if (!response.ok) {
      console.error('Failed to fetch video frame');
      return '/error-image.jpg';
    }
    const data = await response.json();
    return data.url;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-2xl font-bold">Rendering article...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      <video className="mb-10" src={videoUrl} controls />
      <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown">{processedContent}</ReactMarkdown>
    </div>
  );
};

export default ArticleViewer;