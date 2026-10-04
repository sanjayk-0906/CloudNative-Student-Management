const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName, region, isS3Configured } = require('../config/s3');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directory exists for offline fallback
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Upload a file to Amazon S3 (or fallback to local disk if AWS is not configured)
 * @param {Object} file - Multer file object
 * @returns {Promise<{url: string, storage: string, message: string}>}
 */
async function uploadToS3(file) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const fileExtension = path.extname(file.originalname);
  const cleanFileName = path.basename(file.originalname, fileExtension).replace(/[^a-zA-Z0-9]/g, '-');
  const uniqueKey = `students/${Date.now()}-${cleanFileName}${fileExtension}`;

  if (isS3Configured && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype
      });

      await s3Client.send(command);

      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
      return {
        url: s3Url,
        storage: 'AWS S3',
        key: uniqueKey,
        message: 'File successfully uploaded to Amazon S3 bucket'
      };
    } catch (error) {
      console.error('[AWS S3 Error] Failed to upload to S3:', error.message);
      // Fallback to local storage
      const localFilename = `${Date.now()}-${cleanFileName}${fileExtension}`;
      const localPath = path.join(uploadDir, localFilename);
      fs.writeFileSync(localPath, file.buffer);
      return {
        url: `/uploads/${localFilename}`,
        storage: 'Local Fallback',
        message: `S3 upload failed (${error.message}). Saved to local storage fallback.`
      };
    }
  }

  // Graceful local fallback if AWS S3 credentials are not set
  const localFilename = `${Date.now()}-${cleanFileName}${fileExtension}`;
  const localPath = path.join(uploadDir, localFilename);
  fs.writeFileSync(localPath, file.buffer);

  return {
    url: `/uploads/${localFilename}`,
    storage: 'Local Storage',
    message: 'AWS S3 credentials not configured in .env. File saved to local storage fallback.'
  };
}

/**
 * Delete a file from Amazon S3
 * @param {string} fileUrl
 */
async function deleteFromS3(fileUrl) {
  if (!fileUrl || !isS3Configured || !s3Client) return;

  try {
    const s3Prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    if (fileUrl.startsWith(s3Prefix)) {
      const key = fileUrl.replace(s3Prefix, '');
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      await s3Client.send(command);
    }
  } catch (error) {
    console.warn('[AWS S3 Warning] Could not delete file from S3:', error.message);
  }
}

/**
 * Get S3 configuration status
 */
function getS3Status() {
  return {
    configured: isS3Configured,
    bucket: bucketName || 'Not configured',
    region: region || 'us-east-1',
    mode: isS3Configured ? 'AWS S3 Production' : 'Local Fallback (Offline Mode)'
  };
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  getS3Status
};
