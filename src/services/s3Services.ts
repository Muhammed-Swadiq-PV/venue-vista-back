import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dotenv from 'dotenv';

dotenv.config();

// Helper function to ensure environment variables are defined
const getEnvVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
};

const s3Client = new S3Client({
  region: getEnvVariable('AWS_REGION'),
  credentials: {
    accessKeyId: getEnvVariable('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVariable('AWS_SECRET_ACCESS_KEY'),
  },
});

const generateUploadPresignedUrl = async (key: string, expiresIn: number = 60): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: getEnvVariable('S3_BUCKET_NAME'),
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
};

const generateDownloadPresignedUrl = async (key: string, expiresIn: number = 60): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: getEnvVariable('S3_BUCKET_NAME'),
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
};

export {
  generateUploadPresignedUrl,
  generateDownloadPresignedUrl,
};
