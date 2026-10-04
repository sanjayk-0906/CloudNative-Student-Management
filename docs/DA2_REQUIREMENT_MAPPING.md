# College DA2 Cloud Computing Requirement Mapping

This document provides a direct, comprehensive compliance matrix proving that the **CloudNative Student Management Platform** implements and demonstrates every specific cloud computing concept required in the college DA2 question.

---

## 📊 DA2 Cloud Architecture Compliance Matrix

| DA2 Syllabus Requirement | Architectural Concept | Implementation in Project | AWS Cloud Service | Source Code / Configuration File |
| :--- | :--- | :--- | :--- | :--- |
| **1. Deployment Model** | Public Cloud Infrastructure | Deployed on AWS public cloud using a 3-tier stateless web architecture across multiple Availability Zones. | Amazon Web Services (AWS) | [deployment/setup-ec2.sh](file:///deployment/setup-ec2.sh), [deployment/nginx.conf](file:///deployment/nginx.conf) |
| **2. Database** | Managed Relational Database Service | `student_management` database with tables (`students`, `attendance`, `marks`), foreign keys, and indexes hosted on managed MySQL in private subnets. | Amazon RDS for MySQL 8.0 | [database/schema.sql](file:///database/schema.sql), [database/seed.sql](file:///database/seed.sql), [backend/src/config/db.js](file:///backend/src/config/db.js) |
| **3. Storage** | Cloud Object Storage | Secure storage for student profile pictures and academic documents with AWS SDK v3 and offline disk fallback. | Amazon S3 | [backend/src/config/s3.js](file:///backend/src/config/s3.js), [backend/src/services/s3Service.js](file:///backend/src/services/s3Service.js) |
| **4. Networking** | Virtual Private Cloud & Subnet Tiering | Custom VPC (`10.0.0.0/16`) containing Public Subnets (for ALB & IGW) and Private Subnets (for EC2 and isolated RDS). | Amazon VPC | [docs/NETWORKING.md](file:///docs/NETWORKING.md) |
| **5. Security** | Defense-in-Depth & Least Privilege | Layered Security Groups (`ALB-SG` &rarr; `EC2-SG` &rarr; `RDS-SG`), IAM role profiles, private database isolation (no 0.0.0.0/0 on 3306), Helmet HTTP headers, CORS, and parameterized SQL queries. | AWS IAM & VPC Security Groups | [backend/src/server.js](file:///backend/src/server.js), [docs/SECURITY.md](file:///docs/SECURITY.md) |
| **6. Scalability** | Elastic Load Balancing & Auto Scaling | Application Load Balancer distributing requests via Round Robin across an Auto Scaling Group (Min: 2, Desired: 2, Max: 4) scaling on CPU threshold (&gt;60%). | Application Load Balancer & EC2 Auto Scaling | [docs/SCALABILITY.md](file:///docs/SCALABILITY.md), [backend/src/controllers/healthController.js](file:///backend/src/controllers/healthController.js) |
| **7. Monitoring** | Telemetry, Metrics & Centralized Logging | Amazon CloudWatch monitoring EC2 CPU, RAM, ALB response latencies, Morgan HTTP access logs, and live `/api/health` polling. | Amazon CloudWatch | [backend/src/server.js](file:///backend/src/server.js), [docs/MONITORING.md](file:///docs/MONITORING.md) |
| **8. Backup** | Automated Backups & Snapshots | Amazon RDS 7-day automated backup window with Point-in-Time Recovery (PITR) and manual DB snapshot creation. S3 bucket versioning. | Amazon RDS Automated Backups & S3 Versioning | [docs/BACKUP_AND_DR.md](file:///docs/BACKUP_AND_DR.md) |
| **9. Disaster Recovery** | Self-Healing & Rapid DB Recovery | Detailed runbook for RDS snapshot restoration (&lt;15 min RTO) and automatic EC2 instance self-healing via Auto Scaling Group without user disruption. | Amazon RDS Snapshots + EC2 Auto Scaling | [docs/BACKUP_AND_DR.md](file:///docs/BACKUP_AND_DR.md) |

---

## 🎯 Verification Checklist for Evaluator / Examiner

- [x] **Working Application**: React + Vite frontend communicates seamlessly with Express REST API.
- [x] **Database Connectivity**: Uses MySQL with connection pool and prepared parameterized statements.
- [x] **Sample Dataset**: 12 fictional students pre-seeded with full attendance logs and marks for all 5 subjects.
- [x] **Defaulter Highlighting**: Students with attendance below 75% are highlighted with warning badges.
- [x] **Marks Processing**: Computes Totals, Averages, and Pass/Fail status for Data Structures, DBMS, Cloud Computing, Computer Networks, and Operating Systems.
- [x] **S3 Storage Feature**: Optional profile photo upload integrated with AWS S3 and local storage fallback.
- [x] **Health Check Endpoint**: `GET /api/health` returns HTTP 200 with database and AWS configuration status.
- [x] **Visual AWS Architecture**: Frontend includes an interactive AWS Architecture Explorer mapping all 9 DA2 concepts.
- [x] **Zero Hardcoded Secrets**: Uses `.env` and `.env.example` to prevent credential exposure.
