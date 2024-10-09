import { useState, useCallback } from 'react';

export function useGetVideoUrl() {
  
  const getVideoUrl = useCallback(async (fileName: string) => {
    
    try {
      const response = await fetch(`/api/get-video-url?file=${fileName}`);
      if (!response.ok) {
        throw new Error('Failed to get video URL');
      }
      const url = await response.json();
      return url;
    } catch (err) {

      return null;
    }
  }, []);

  return getVideoUrl;
}
