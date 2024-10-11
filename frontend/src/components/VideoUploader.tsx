import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useGetVideoUrl } from '@/lib/hooks/useGetVideoUrl';
import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_ARTICLE = gql`
  mutation CreateArticle($videoUrl: String!) {
    createArticleFromVideo(videoUrl: $videoUrl) {
      id
      videoName
      content
      title
    }
  }
`;

interface VideoUploaderProps {
  onVideoUploaded: (data: any) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setError] = useState<string | null>(null);
  const [creatingArticle, setCreatingArticle] = useState(false);
  const uploadFile = useFileUpload();
  const getVideoUrl = useGetVideoUrl();
  const [createArticle, { loading, error }] = useMutation(CREATE_ARTICLE);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setError(null);
    setUploading(true);
    const fileName = await uploadFile(file.name, file)
    console.log(fileName)
    if (fileName){
        const videoUrl = await getVideoUrl(fileName);
        console.log(videoUrl)
        if (videoUrl){
            setUploading(false);
            setCreatingArticle(true);
            try {
                const { data } = await createArticle({ variables: { videoUrl } });
                console.log(data)
                console.log(data.createArticleFromVideo)
                onVideoUploaded(data.createArticleFromVideo);
            } catch (err) {
                console.error("Error creating article:", err);
                setError("Failed to create article. Please try again.");
            } finally {
                setCreatingArticle(false);
            }
        } else {
            setError("Failed to get video URL. Please try again.");
            setUploading(false);
        }
    } else {
        setError("Upload failed. Please try again.");
        setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700">
            Upload Video
          </label>
          <input
            type="file"
            id="video-upload"
            accept="video/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
        </div>
        {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
        <button
          type="submit"
          disabled={!file || uploading || creatingArticle}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : creatingArticle ? 'Creating Article...' : 'Convert to Article'}
        </button>
        {(uploading || creatingArticle) && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mt-1">
              {uploading ? 'Uploading video...' : 'Creating article... This may take a minute.'}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default VideoUploader;