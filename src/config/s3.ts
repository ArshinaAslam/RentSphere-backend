// // config/s3.ts - v3 + YOUR BEST FEATURES!
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { v4 as uuidv4 } from 'uuid';




// const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });



// export const uploadToS3 = async (
//   file: Express.Multer.File, 
//   prefix: string = 'avatars',  
//   userId: string
// ): Promise<string> => {
//   const fileName = `${prefix}/${userId}/${uuidv4()}-${file.originalname}`;
  
//   const params: PutObjectCommand['input'] = {
//     Bucket: process.env.AWS_S3_BUCKET!,
//     Key: fileName,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL: 'public-read',  
//     Metadata: {  
//       'uploaded-by': 'rentsphere-service',
//       'file-type': file.mimetype,
//       'user-id': userId,
//     },
//   };


//   const result = await s3Client.send(new PutObjectCommand(params));


//    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

//   console.log(`S3 Upload Success: ${fileUrl}`);
//   return fileUrl
// };

// export const deleteFromS3 = async (key: string): Promise<void> => {
//   const params: DeleteObjectCommand['input'] = {
//     Bucket: process.env.AWS_S3_BUCKET!,
//     Key: key,
//   };
  
//   await s3Client.send(new DeleteObjectCommand(params));
//   console.log(`Deleted: ${key}`);
// };


// backend/src/config/s3.ts
import { ENV } from '../config/env';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';


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
  prefix: string = 'avatars',  
  userId: string
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

  console.log(`S3 Upload Success: ${fileUrl}`);
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