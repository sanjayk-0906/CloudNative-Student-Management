const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env')
});

const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.S3_BUCKET_NAME;

// AWS SDK automatically uses the EC2 IAM role credentials
const s3Client = new S3Client({
  region
});

const isS3Configured = Boolean(
  bucketName && bucketName.trim() !== ''
);

module.exports = {
  s3Client,
  bucketName,
  region,
  isS3Configured
};