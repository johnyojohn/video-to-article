import type { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const { query, method } = req;


  const fileName = query.file as string;
  if (!fileName) {
    return res.status(400).json('File name is required');
  }

  const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY,
    },
  });

  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const file = bucket.file(fileName);

  // Generate a signed URL that's valid for 1 hour
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json(url);
}