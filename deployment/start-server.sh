#!/usr/bin/env bash
# ==============================================================================
# CloudNative Student Management Platform - Start Server Script
# Builds Frontend, Installs Backend Dependencies, and Starts PM2 Service
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "🚀 Deploying from directory: ${PROJECT_ROOT}"

# 1. Install and Build Frontend
echo "📦 Building Frontend..."
cd "${PROJECT_ROOT}/frontend"
npm install --silent
npm run build

# 2. Install Backend Dependencies
echo "📦 Installing Backend dependencies..."
cd "${PROJECT_ROOT}/backend"
npm install --production --silent

# 3. Initialize Database (if needed)
echo "🔄 Checking Database connectivity..."
npm run db:init || echo "⚠️ Database init skipped or already initialized"

# 4. Start / Restart Express Server with PM2
echo "⚡ Starting Backend API with PM2..."
pm2 delete student-backend 2> /dev/null || true
pm2 start src/server.js --name "student-backend" --time

# 5. Save PM2 startup list
pm2 save
sudo pm2 startup | tail -n 1 | bash 2> /dev/null || true

# 6. Restart Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "========================================================="
echo "🎉 CloudNative Student Platform is LIVE!"
echo "📡 Health check: curl http://localhost:5000/api/health"
echo "📊 PM2 status: pm2 status"
echo "========================================================="
