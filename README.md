# CloudNative Student Management Platform
### College DA2 Cloud Computing Project | AWS 3-Tier Architecture

[![AWS Cloud](https://img.shields.io/badge/AWS-Cloud%20Native-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%20%2F%20RDS-blue?logo=mysql)](https://www.mysql.com/)

---

## 1. Project Overview
The **CloudNative Student Management Platform** is a full-stack, cloud-native web platform designed for educational institutions to manage student records, daily attendance compliance, and semester examination results. Built specifically for a college **Cloud Computing DA2 assignment**, it models a production-grade **AWS 3-Tier Architecture** incorporating compute, database, object storage, networking, security, monitoring, elastic auto scaling, backup, and disaster recovery.

---

## 2. Problem Statement
Traditional on-premises college management systems suffer from single points of failure, unmanaged database corruption, inability to scale during exam result publishing surges, and security vulnerabilities from publicly exposed database servers. This project solves these challenges by architecting a modern, highly available, fault-tolerant, and secure cloud platform on **Amazon Web Services (AWS)**.

---

## 3. Objectives
1. Build a working full-stack student management application with real-time analytics.
2. Implement and demonstrate key AWS cloud architecture concepts:
   - **Deployment Model**: Public Cloud (AWS multi-AZ deployment).
   - **Database**: Managed MySQL via Amazon RDS.
   - **Storage**: Unstructured file storage via Amazon S3.
   - **Networking**: Subnet isolation and routing via Amazon VPC.
   - **Security**: Defense-in-depth via Security Groups, IAM least privilege, and private subnets.
   - **Scalability**: Horizontal elastic scaling via Application Load Balancer & Auto Scaling.
   - **Monitoring**: Telemetry and logs via Amazon CloudWatch and `/api/health`.
   - **Backup & Disaster Recovery**: RDS automated backups, manual snapshots, and EC2 self-healing.
3. Provide an intuitive user interface and interactive architecture explorer for viva demonstration.

---

## 4. Key Application Features
- **Student Management**: Add, view, search, filter (by Department & Year), edit, and delete students.
- **Attendance Management**: Mark daily student attendance (Present/Absent), bulk mark whole batches, compute attendance percentages, and highlight shortage defaulters (<75%).
- **Marks & Results**: Enter and edit marks for 5 core subjects (*Data Structures, DBMS, Cloud Computing, Computer Networks, Operating Systems*), calculate totals, averages, and determine Pass/Fail status.
- **Dashboard Analytics**: Real-time KPI cards, department distribution charts, attendance compliance brackets, and subject performance metrics.
- **Amazon S3 Document Upload**: Direct upload of student profile pictures to AWS S3 with local storage fallback.
- **Admin Authentication**: Demo admin login (`admin` / `admin123`) with zero exposure of cloud credentials to the frontend.
- **Interactive AWS Architecture Explorer**: Built-in visual diagram mapping every AWS service to DA2 criteria.

---

## 5. Technology Stack
- **Frontend**: React 18, Vite, JavaScript, CSS3 (Custom Responsive Design System), Lucide Icons, React Router 6.
- **Backend**: Node.js 20, Express.js REST API, `mysql2/promise` (connection pooling), `helmet` (security headers), `cors`, `multer`, `morgan` (logging), `@aws-sdk/client-s3`.
- **Database**: MySQL 8.0 / Amazon RDS for MySQL.
- **Cloud Infrastructure**: AWS EC2, Amazon RDS, Amazon S3, Amazon VPC, Application Load Balancer, EC2 Auto Scaling, AWS IAM, Amazon CloudWatch.

---

## 6. Architecture

```
                                +---------------------------+
                                |  INTERNET / FACULTY /     |
                                |       STUDENTS            |
                                +---------------------------+
                                              |
                                              v
                      =================================================
                      |                Amazon VPC                     |
                      |              (10.0.0.0/16)                    |
                      |                                               |
                      |   +---------------------------------------+   |
                      |   |           PUBLIC SUBNETS              |   |
                      |   |   +-------------------------------+   |   |
                      |   |   |  Application Load Balancer    |   |   |
                      |   |   |            (ALB)              |   |   |
                      |   |   |   Health: /api/health (200)   |   |   |
                      |   |   +-------------------------------+   |   |
                      |   +---------------------------------------+   |
                      |                       |                       |
                      |       +---------------+---------------+       |
                      |       |                               |       |
                      |       v                               v       |
                      |   +---------------------------------------+   |
                      |   |       PRIVATE APPLICATION SUBNETS     |   |
                      |   |   +---------------+---------------+   |   |
                      |   |   | EC2-1 Backend | EC2-2 Backend |   |   |
                      |   |   | Node.js/Nginx | Node.js/Nginx |   |   |
                      |   |   +---------------+---------------+   |   |
                      |   +---------------------------------------+   |
                      |                       |                       |
                      |                       v                       |
                      |   +---------------------------------------+   |
                      |   |       PRIVATE DATABASE SUBNETS        |   |
                      |   |   +-------------------------------+   |   |
                      |   |   |      AWS RDS MySQL 8.0        |   |   |
                      |   |   |     (Multi-AZ Database)       |   |   |
                      |   |   +-------------------------------+   |   |
                      |   +---------------------------------------+   |
                      =================================================
```

---

## 7. Database Design
The MySQL schema (`student_management`) comprises 3 normalized tables:
- `students`: `id`, `register_number` (UNIQUE), `name`, `email`, `phone`, `department`, `year`, `section`, `profile_image_url`, timestamps.
- `attendance`: `id`, `student_id` (FK), `date`, `status` ('Present'/'Absent'), `remarks`, timestamps. Unique constraint on `(student_id, date)`.
- `marks`: `id`, `student_id` (FK), `subject`, `marks`, `max_marks`, `semester`, `exam_type`, timestamps. Unique constraint on `(student_id, subject, exam_type)`.

---

## 8. Local Installation & Quickstart

### Prerequisites
- Node.js 18+ and npm installed.
- MySQL 8.0 running locally (or via Docker).

### Clone & Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd CAD_DA2

# 2. Copy environment file
cp .env.example .env
```

---

## 9. Environment Variables (`.env`)
Configure your `.env` in the project root:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_management

# Optional AWS S3 Configuration (leave blank for local storage fallback)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

---

## 10. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
The React frontend will be available at: **`http://localhost:3000`**

---

## 11. Running Backend
```bash
cd backend
npm install

# Initialize schema and seed data (12 sample students with attendance and marks)
npm run db:init

# Start the Express API
npm start
```
The REST API will be available at: **`http://localhost:5000`**  
Health Check: **`http://localhost:5000/api/health`**

---

## 12. Docker Setup (Alternative Local Development)
To run the complete stack (Backend + MySQL) using Docker Compose:
```bash
docker-compose up --build
```
This automatically boots MySQL 8.0, creates the database, loads the schema and seed data, and starts the Express backend on port 5000.

---

## 13. AWS Production Deployment Overview
Deploying to AWS follows a clean 3-tier sequence:
1. Create VPC with Public & Private Subnets.
2. Create Security Groups with chained access rules.
3. Launch AWS RDS MySQL instance in Private Subnets.
4. Launch EC2 instances in Private Subnets with PM2 and Nginx.
5. Create Application Load Balancer in Public Subnets and point target group to EC2.
6. Create S3 Bucket and CloudWatch alarms.

---

## 14. EC2 Configuration & Setup
On the EC2 instance (Ubuntu 22.04 / Amazon Linux 2023):
```bash
# Clone the project
git clone <repo-url> /var/www/student-platform
cd /var/www/student-platform

# Make scripts executable and run setup
chmod +x deployment/setup-ec2.sh deployment/start-server.sh
./deployment/setup-ec2.sh

# Configure .env with RDS endpoint
nano .env

# Start application and Nginx reverse proxy
./deployment/start-server.sh
```

---

## 15. RDS Configuration
1. Go to **AWS RDS Console** &rarr; **Create database**.
2. Choose **MySQL 8.0**.
3. Template: **Dev/Test** (or Free Tier: `db.t3.micro`).
4. DB Instance Identifier: `student-management-db`.
5. Master username: `admin`, Master password: `YourStrongPassword123`.
6. Virtual Private Cloud: Select your custom VPC.
7. Subnet Group: Select Private DB Subnet Group.
8. Public Access: **No** (Strict Isolation).
9. VPC Security Group: Choose `RDS-SG`.
10. Initial Database Name: `student_management`.
11. Enable **Automated Backups** (7-day retention).

---

## 16. Amazon S3 Configuration
1. Go to **AWS S3 Console** &rarr; **Create bucket**.
2. Bucket Name: `cloudnative-student-platform-bucket`.
3. AWS Region: `us-east-1`.
4. Enable **Bucket Versioning** (for disaster recovery & object protection).
5. Set IAM policy on EC2 role or provide access keys in `.env`.

---

## 17. Amazon VPC Configuration
- **VPC CIDR**: `10.0.0.0/16`
- **Public Subnet 1 (`us-east-1a`)**: `10.0.1.0/24` (ALB, NAT Gateway, IGW)
- **Public Subnet 2 (`us-east-1b`)**: `10.0.2.0/24` (ALB, IGW)
- **Private App Subnet 1 (`us-east-1a`)**: `10.0.10.0/24` (EC2-1)
- **Private App Subnet 2 (`us-east-1b`)**: `10.0.20.0/24` (EC2-2)
- **Private DB Subnet 1 (`us-east-1a`)**: `10.0.100.0/24` (RDS Primary)
- **Private DB Subnet 2 (`us-east-1b`)**: `10.0.200.0/24` (RDS Standby)

---

## 18. Security Groups Setup
- **`ALB-SG`**:
  - Inbound: HTTP (Port 80) from `0.0.0.0/0`, HTTPS (Port 443) from `0.0.0.0/0`.
- **`EC2-SG`**:
  - Inbound: Custom TCP (Port 5000) & HTTP (Port 80) strictly from `ALB-SG`.
- **`RDS-SG`**:
  - Inbound: MySQL (Port 3306) strictly from `EC2-SG`.
  - **No public IP and no 0.0.0.0/0 access.**

---

## 19. Application Load Balancer (ALB) Setup
- **Scheme**: Internet-facing.
- **Listeners**: Port 80 / Port 443.
- **Target Group**: Targets registered EC2 instances on port 80 (Nginx) or 5000.
- **Health Check Path**: `/api/health`.
- **Health Check Status**: Expects `200 OK`.

---

## 20. EC2 Auto Scaling Configuration
- **Launch Template**: Installs Node.js, PM2, pulls application, starts server.
- **Capacity**: Min: `2`, Desired: `2`, Max: `4`.
- **Scaling Policy**: Target Tracking on Average CPU Utilization > 60%.
- **Health Check Type**: ELB (Application Load Balancer health check).

---

## 21. Amazon CloudWatch Monitoring
- **Metrics**: EC2 `CPUUtilization`, `NetworkIn`/`NetworkOut`, ALB `TargetResponseTime`, `HTTPCode_Target_5XX_Count`, RDS `DatabaseConnections`.
- **Logs**: Aggregates Express Morgan access logs and Nginx error logs into `/aws/ec2/student-platform/application`.
- **Alarms**: Triggers auto-scaling scale-out when CPU exceeds 60% for 2 minutes.

---

## 22. Backup Strategies
- **RDS Automated Backups**: Retained for 7 days with Point-in-Time Recovery (PITR).
- **RDS Manual Snapshots**: Taken before major examinations or data modifications.
- **S3 Versioning**: Allows instantaneous recovery of accidentally replaced student documents.

---

## 23. Disaster Recovery (DR) Scenarios

### Scenario 1: RDS Database Corruption
1. Identify failure via CloudWatch alarm or `/api/health`.
2. Go to RDS Console &rarr; Snapshots &rarr; Select snapshot &rarr; **Restore snapshot**.
3. Enter new DB identifier `student-db-restored` in the same private VPC subnet.
4. Update `DB_HOST` in `.env` and restart backend with `pm2 restart student-backend`.
5. Verify `/api/health` and check student data.

### Scenario 2: EC2 Instance Crash
1. ALB detects consecutive health check failures on `/api/health`.
2. ALB stops routing traffic to the failed instance and routes to the healthy peer.
3. Auto Scaling Group terminates the crashed instance and provisions a new one automatically.
4. Total Recovery Time: < 2 minutes with zero user downtime.

---

## 24. Testing & Verification
Verify all routes and services locally or on AWS:
```bash
# 1. Health Check Test
curl -i http://localhost:5000/api/health

# 2. Get Students List
curl http://localhost:5000/api/students

# 3. Get Attendance Summary (Check 75% Defaulters)
curl http://localhost:5000/api/attendance/summary

# 4. Get Marks & Results
curl http://localhost:5000/api/marks/summary

# 5. Get Dashboard Analytics
curl http://localhost:5000/api/dashboard
```

---

## 25. 10-Minute College Demo Procedure
1. **Login (1 min)**: Open `http://localhost:3000/login`. Click **Auto-Fill Demo Credentials** (`admin` / `admin123`) and explain that AWS credentials are secured server-side.
2. **Dashboard (2 mins)**: Show total students (12), average attendance, defaulter count, average marks, and department distribution charts.
3. **AWS Architecture Explorer (2 mins)**: On the Dashboard, click through the interactive AWS diagram (ALB, EC2, RDS, S3, VPC, IAM, CloudWatch) to explain the 3-tier cloud design.
4. **Student Management & S3 (2 mins)**: Navigate to `/students`. Show search and filter by Department. Add a new student and upload a profile picture.
5. **Attendance & 75% Defaulter Warning (1.5 mins)**: Navigate to `/attendance`. Show calculated attendance percentages and point out students highlighted in red due to <75% attendance.
6. **Marks & Pass/Fail Evaluation (1 min)**: Navigate to `/marks`. Show scorecards for the 5 subjects (*Data Structures, DBMS, Cloud Computing, Computer Networks, Operating Systems*) and explain the Pass/Fail logic.
7. **Health Telemetry & AWS Mapping (0.5 min)**: Navigate to `/architecture`. Ping `/api/health` to show HTTP 200 OK status and display the complete DA2 requirement mapping matrix.

---

## 📚 Documentation Reference Index
- [AWS Architecture Overview (docs/AWS_ARCHITECTURE.md)](docs/AWS_ARCHITECTURE.md)
- [VPC & Networking Configuration (docs/NETWORKING.md)](docs/NETWORKING.md)
- [Security & IAM Architecture (docs/SECURITY.md)](docs/SECURITY.md)
- [Scalability & Load Balancing (docs/SCALABILITY.md)](docs/SCALABILITY.md)
- [CloudWatch Monitoring (docs/MONITORING.md)](docs/MONITORING.md)
- [Backup & Disaster Recovery Runbook (docs/BACKUP_AND_DR.md)](docs/BACKUP_AND_DR.md)
- [DA2 Requirement Compliance Matrix (docs/DA2_REQUIREMENT_MAPPING.md)](docs/DA2_REQUIREMENT_MAPPING.md)
- [ASCII Architecture Map (docs/aws-architecture.md)](docs/aws-architecture.md)
