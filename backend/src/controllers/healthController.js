const { checkDatabaseConnection } = require('../config/db');
const { getS3Status } = require('../services/s3Service');

/**
 * Health check endpoint for ALB (Application Load Balancer) & CloudWatch & Local Status
 * GET /api/health
 */
async function getHealth(req, res) {
  const dbStatus = await checkDatabaseConnection();
  const s3Status = getS3Status();
  const isAwsProduction = process.env.AWS_DEPLOYMENT === 'true' || process.env.NODE_ENV === 'production';

  const responseData = {
    status: 'healthy',
    service: 'student-management-api',
    timestamp: new Date().toISOString(),
    uptime: Number(process.uptime().toFixed(2)),
    environment: isAwsProduction ? 'AWS Production' : 'Local Development',
    deployment_type: isAwsProduction ? 'AWS ALB / EC2' : 'Localhost',
    database: {
      status: dbStatus.connected ? 'connected' : 'disconnected',
      label: dbStatus.connected ? 'Online' : 'Offline',
      mode: dbStatus.mode,
      host: dbStatus.host,
      database: dbStatus.database,
      port: dbStatus.port,
      ...(dbStatus.error && { error: dbStatus.error })
    },
    aws: {
      s3Configured: s3Status.configured,
      s3Label: s3Status.configured ? 'AWS S3 Connected' : 'Local Demo Mode',
      region: s3Status.region,
      bucket: s3Status.bucket,
      mode: s3Status.mode
    }
  };

  // Return HTTP 200 for health checks
  return res.status(200).json(responseData);
}

module.exports = {
  getHealth
};
