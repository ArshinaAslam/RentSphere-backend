import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

import { ENV } from "../config/env";

let _s3Client: S3Client | null = null;

const getS3Client = () => {
  if (!_s3Client) {
    if (!ENV.AWS_ACCESS_KEY_ID || !ENV.AWS_REGION) {
      console.error("AWS Config missing!");
      throw new Error("Missing AWS Credentials");
    }
    _s3Client = new S3Client({
      region: ENV.AWS_REGION,
      credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _s3Client;
};

export const uploadToS3 = async (
  file: Express.Multer.File,
  prefix: string = "avatars",
  userId: string,
): Promise<string> => {
  const fileName = `${prefix}/${userId}/${uuidv4()}-${file.originalname}`;
  const client = getS3Client();

  const params = {
    Bucket: ENV.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await client.send(new PutObjectCommand(params));

  const fileUrl = `https://${ENV.AWS_S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${fileName}`;

  return fileUrl;
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  const client = getS3Client();
  const params = {
    Bucket: ENV.AWS_S3_BUCKET,
    Key: key,
  };

  await client.send(new DeleteObjectCommand(params));
};
