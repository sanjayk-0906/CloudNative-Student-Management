const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { checkDatabaseConnection } = require('./config/db');
const { getS3Status } = require('./services/s3Service');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const marksRoutes = require('./routes/marksRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------------------------------------------------
// Security & Utility Middlewares
// ------------------------------------------------------------------------------
// Helmet for HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration (allow requests from frontend development server and production domain)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging for Amazon CloudWatch log streams
app.use(morgan('combined'));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local upload files fallback if S3 is not connected
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// ------------------------------------------------------------------------------
// REST API Routes
// ------------------------------------------------------------------------------
app.use('/api/health', healthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CloudNative Student Management Platform REST API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'Running'
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// ------------------------------------------------------------------------------
// Start Server and Perform Infrastructure Health Check
// ------------------------------------------------------------------------------
const server = app.listen(PORT, async () => {
  console.log('================================================================');
  console.log(`🚀 CloudNative Student Management Backend running on port ${PORT}`);
  console.log(`🌐 Health check endpoint: http://localhost:${PORT}/api/health`);
  console.log('================================================================');

  // Verify Database Connection
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    console.log(`✅ Database: Connected to MySQL [${dbStatus.host}:${dbStatus.port}/${dbStatus.database}]`);
  } else {
    console.warn(`⚠️ Database: Disconnected or connecting... (${dbStatus.error})`);
    console.warn(`💡 Tip: Run 'npm run db:init' to initialize database schema and seed data.`);
  }

  // Verify AWS S3 Configuration
  const s3Status = getS3Status();
  if (s3Status.configured) {
    console.log(`✅ AWS S3: Configured (Bucket: ${s3Status.bucket}, Region: ${s3Status.region})`);
  } else {
    console.log(`ℹ️ AWS S3: Not configured in .env. Operating in Local Storage fallback mode.`);
  }
  console.log('================================================================');
});

module.exports = app;
