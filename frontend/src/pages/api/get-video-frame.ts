import type { NextApiRequest, NextApiResponse } from 'next';
import { Storage } from '@google-cloud/storage';
import { join } from 'path';
import { promises as fs } from 'fs';
import extractFrames from 'ffmpeg-extract-frames';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

//TODO: CACHE THE VIDEO FRAMES

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.BUCKET_NAME!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { videoName, timestamp } = req.query;

  if (typeof videoName !== 'string' || typeof timestamp !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const frameBuffer = await generateVideoFrame(videoName, timestamp);
    
    // Generate a unique filename for this frame
    const frameFileName = `frames/${videoName.replace('.mp4', '')}_frame_${timestamp.replace(':', '_')}.jpg`;
    
    // Upload the frame to Google Cloud Storage
    const file = bucket.file(frameFileName);
    await file.save(frameBuffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    });

    // Set expiration time (e.g., 1 hour from now)
    const expirationTime = Date.now() + 60 * 60 * 10*1000; // 10 hours
    await file.setMetadata({
      metadata: {
        autoDeleteTime: expirationTime.toString(),
      },
    });

    // Generate a signed URL that expires in 1 hour
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: expirationTime,
    });

    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error('Error getting video frame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateVideoFrame(videoName: string, timestamp: string): Promise<Buffer> {
  const videoFile = bucket.file(videoName);
  const [videoBuffer] = await videoFile.download();
  const tempDir = join(process.cwd(), 'temp');
  const tempVideoPath = join(tempDir, videoName);
  const tempFramePath = join(tempDir, `frame_${Date.now()}.jpg`);

  try {
    // Ensure the temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Write the video buffer to a temporary file
    await fs.writeFile(tempVideoPath, videoBuffer);

    const offset = parseTimestamp(timestamp);
    console.log("OFFSET: ", offset);

    // Use -y flag to overwrite output file if it exists
    const ffmpegCommand = `"${ffmpeg.path}" -y -i "${tempVideoPath}" -ss ${offset/1000} -vframes 1 "${tempFramePath}"`;
    
    const { stdout, stderr } = await execPromise(ffmpegCommand);


    // Check if the frame file was actually created
    if (!(await fs.stat(tempFramePath).catch(() => false))) {
      throw new Error('Frame file was not created');
    }

    const frameBuffer = await fs.readFile(tempFramePath);
    return frameBuffer;
  } catch (error) {
    console.error('Error in generateVideoFrame:', error);
    throw error;
  } finally {
    // Clean up temporary files
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempFramePath).catch(() => {});
    // Don't remove the temp directory, as it might be used by other requests
  }
}

function parseTimestamp(timestamp: string): number {
    const parts = timestamp.split(':').map(Number);
    let hours = 0, minutes = 0, seconds = 0;
  
    if (parts.length === 3) {
      [hours, minutes, seconds] = parts;
    } else if (parts.length === 2) {
      [minutes, seconds] = parts;
    } else {
      throw new Error('Invalid timestamp format');
    }
  
    console.log("HOURS:", hours, "MINUTES:", minutes, "SECONDS:", seconds);
    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
    console.log("TOTAL MILLISECONDS:", totalMilliseconds);
    return totalMilliseconds;
  }