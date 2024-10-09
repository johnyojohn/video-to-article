import type { NextApiRequest, NextApiResponse } from "next";
import { SignedPostPolicyV4Output } from "@google-cloud/storage";
import { Storage } from "@google-cloud/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignedPostPolicyV4Output & { fileName: string } | string>
) {
  const { query, method } = req;
  
  const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY,
    },
  });

  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const file = bucket.file(query.file as string);
  const options = {
    expires: Date.now() + 5 * 60 * 1000, //  5 minutes,
    fields: { "x-goog-meta-source": "nextjs-project" },
  };
  const [response] = await file.generateSignedPostPolicyV4(options);
  res.status(200).json({
    ...response,
    fileName: query.file as string
  });
}