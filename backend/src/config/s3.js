const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.S3_BUCKET_NAME;

const isS3Configured = Boolean(
  accessKeyId &&
  secretAccessKey &&
  bucketName &&
  accessKeyId.trim() !== '' &&
  secretAccessKey.trim() !== '' &&
  bucketName.trim() !== ''
);

let s3Client = null;

if (isS3Configured) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  } catch (err) {
    console.warn('[AWS S3 Warning] Failed to initialize S3 Client:', err.message);
  }
}

module.exports = {
  s3Client,
  bucketName,
  region,
  isS3Configured
};
