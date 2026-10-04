# AWS Cloud-Native Architecture Documentation

## 1. Architectural Overview

The **CloudNative Student Management Platform** is architected according to AWS Well-Architected Framework principles (Reliability, Security, Performance Efficiency, Cost Optimization, and Operational Excellence). It implements a 3-tier stateless cloud architecture:

```
                            +-----------------------------------------+
                            |            INTERNET (Users)             |
                            +-----------------------------------------+
                                                 |
                                                 v
                            +-----------------------------------------+
                            |   Amazon Route 53 / AWS CloudFront      |
                            +-----------------------------------------+
                                                 |
                                                 v
                            +-----------------------------------------+
                            |     Application Load Balancer (ALB)     |
                            |             [Public Subnet]             |
                            +-----------------------------------------+
                                           /           \
                                          /             \
                                         v               v
                +--------------------------------+ +--------------------------------+
                |     EC2 Instance (AZ-1)        | |     EC2 Instance (AZ-2)        |
                |       [Private Subnet]         | |       [Private Subnet]         |
                |  Nginx Reverse Proxy (Port 80) | |  Nginx Reverse Proxy (Port 80) |
                |  Node.js Backend (Port 5000)   | |  Node.js Backend (Port 5000)   |
                +--------------------------------+ +--------------------------------+
                                         \               /
                                          \             /
                                           v           v
                            +-----------------------------------------+
                            |      Amazon RDS MySQL 8.0 Multi-AZ      |
                            |          [Private DB Subnets]           |
                            +-----------------------------------------+

                            +--------------------+ +--------------------+
                            |     Amazon S3      | |  Amazon CloudWatch |
                            |  (Object Storage)  | | (Telemetry & Logs) |
                            +--------------------+ +--------------------+
```

---

## 2. Component Design & Roles

### 2.1 Ingress Tier (Application Load Balancer)
- **Role**: Serves as the single public entry point for all HTTP/HTTPS requests.
- **Subnets**: Deployed across 2 Public Subnets (AZ-1a and AZ-1b).
- **Target Groups**: Evaluates registered EC2 targets via periodic health check ping (`GET /api/health`, expecting HTTP 200).
- **SSL Offloading**: Terminates TLS/SSL certificates from AWS Certificate Manager (ACM).

### 2.2 Application Tier (Amazon EC2 & Auto Scaling)
- **Role**: Runs the stateless Node.js / Express.js REST API server.
- **Isolation**: EC2 instances reside inside Private Application Subnets with no public IPv4 addresses.
- **Process Manager**: Managed by PM2 for automatic process restart on failures.
- **Stateless Architecture**: No session or state data is held in instance memory, allowing seamless scaling and zero-downtime rolling deployments.

### 2.3 Database Tier (Amazon RDS MySQL 8.0)
- **Role**: Stores core relational data including student credentials, attendance entries, and semester marks.
- **Isolation**: Located in dedicated Private Database Subnets with no internet gateway route.
- **Resilience**: Configured with Multi-AZ automated standby replica and automated daily snapshots.

### 2.4 Unstructured Storage (Amazon S3)
- **Role**: Stores student profile pictures, verification documents, and export sheets.
- **Durability**: 99.999999999% (11 9s) object durability.
- **Security**: Bucket versioning enabled; access granted via IAM instance roles.

---

## 3. High Availability & Fault Tolerance Design

1. **Multi-AZ Distribution**: Resources are partitioned across at least two AWS Availability Zones (`us-east-1a` and `us-east-1b`).
2. **Health Check Probing**: ALB checks instance health every 30 seconds. Unhealthy instances are automatically detached within 60 seconds.
3. **Database Failover**: In Multi-AZ RDS deployments, failover to the standby replica completes in under 60 seconds with no DNS endpoint change required by the application.
