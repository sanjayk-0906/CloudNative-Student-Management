# EC2 Production Deployment Guide

This directory contains scripts and configurations for deploying the **CloudNative Student Management Platform** to AWS EC2 behind an Application Load Balancer (ALB) and connected to Amazon RDS.

---

## 🏗️ Architecture Overview

```
                 INTERNET (Students & Faculty)
                              |
                              v
                [Application Load Balancer (ALB)]
                  (Public Subnet - Ports 80/443)
                              |
                 +------------+------------+
                 |                         |
                 v                         v
       [EC2 Instance 1]          [EC2 Instance 2]
     (Private App Subnet)      (Private App Subnet)
       • Nginx (Port 80)         • Nginx (Port 80)
       • Node.js PM2 (5000)      • Node.js PM2 (5000)
                 \                         /
                  +-----------+-----------+
                              |
                              v
                  [Amazon RDS (MySQL 8.0)]
                    (Private DB Subnet)
```

---

## 📋 Prerequisites on AWS

1. **VPC with 2 Public Subnets & 2 Private Subnets**
2. **Security Groups**:
   - `ALB-SG`: Inbound TCP 80 from `0.0.0.0/0`
   - `EC2-SG`: Inbound TCP 80 & 5000 from `ALB-SG`
   - `RDS-SG`: Inbound TCP 3306 from `EC2-SG`
3. **RDS MySQL 8.0** created in the Private Subnet.
4. **S3 Bucket** created with block public access adjusted for web assets if needed.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Launch EC2 Instances
- AMI: Ubuntu 22.04 LTS or Amazon Linux 2023
- Instance Type: `t3.micro` or `t3.small`
- Security Group: `EC2-SG`
- Key Pair: Select or create your `.pem` key.

### Step 2: Connect to the EC2 Instance
```bash
ssh -i "your-key.pem" ubuntu@<ec2-public-ip-or-bastion>
```

### Step 3: Run Bootstrap Script
```bash
# Clone the repository
git clone <your-repository-url> /var/www/student-platform
cd /var/www/student-platform

# Make scripts executable
chmod +x deployment/setup-ec2.sh deployment/start-server.sh

# Run the setup script
./deployment/setup-ec2.sh
```

### Step 4: Configure Production Environment Variables
Create `/var/www/student-platform/.env`:
```bash
nano /var/www/student-platform/.env
```

Paste your AWS resource endpoints:
```env
PORT=5000
DB_HOST=student-db.cxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=YourRdsPassword123
DB_NAME=student_management
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET_NAME=cloudnative-student-platform-bucket
```

### Step 5: Start Server & Reverse Proxy
```bash
./deployment/start-server.sh
```

### Step 6: Verify Deployment
1. Test local health check:
   ```bash
   curl http://localhost:5000/api/health
   ```
2. Verify PM2 process:
   ```bash
   pm2 status
   pm2 logs student-backend
   ```
3. Verify Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

---

## 🔄 Updating the Application
When you push code updates:
```bash
cd /var/www/student-platform
git pull
./deployment/start-server.sh
```
