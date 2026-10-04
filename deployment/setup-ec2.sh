#!/usr/bin/env bash
# ==============================================================================
# CloudNative Student Management Platform - EC2 Bootstrap & Setup Script
# Target OS: Ubuntu 22.04 LTS / Amazon Linux 2023 (EC2 Instance)
# ==============================================================================

set -e # Exit immediately on error

echo "========================================================="
echo "🚀 Starting CloudNative Student Management Platform Setup"
echo "========================================================="

# 1. Update system packages
echo "📦 Updating system packages..."
if [ -f /etc/debian_version ]; then
    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install -y curl git nginx build-essential
elif [ -f /etc/system-release ]; then
    sudo dnf update -y
    sudo dnf install -y curl git nginx gcc gcc-c++ make
fi

# 2. Install Node.js 20.x LTS
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs || sudo dnf install -y nodejs
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Install PM2 globally for production process management
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# 4. Create App Directory
APP_DIR="/var/www/student-platform"
echo "📂 Creating application directory at ${APP_DIR}..."
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

# 5. Copy or clone project code into ${APP_DIR}
# (If using git: git clone <repo_url> ${APP_DIR})

# 6. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx reverse proxy..."
if [ -f /etc/nginx/sites-available ]; then
    sudo cp /var/www/student-platform/deployment/nginx.conf /etc/nginx/sites-available/student-platform.conf
    sudo ln -sf /etc/nginx/sites-available/student-platform.conf /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
else
    sudo cp /var/www/student-platform/deployment/nginx.conf /etc/nginx/conf.d/student-platform.conf
fi

# 7. Test Nginx Configuration
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "========================================================="
echo "✅ EC2 Setup Complete!"
echo "👉 Next steps: Configure .env and run ./start-server.sh"
echo "========================================================="
