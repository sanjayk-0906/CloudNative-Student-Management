# AWS Architecture Reference

## 1. End-to-End ASCII Architecture Diagram

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

## 2. Supporting Cloud Services & Roles

These AWS services operate alongside the primary compute and data tier to provide durability, security, observability, and business continuity:

```
+--------------------------+  -------------------------------------------------------------
|        Amazon S3         |  Cloud Object Storage for student profile photos and documents
|      Object Storage      |  with automated bucket versioning and lifecycle policies.
+--------------------------+  -------------------------------------------------------------

+--------------------------+  -------------------------------------------------------------
|     Amazon CloudWatch    |  Monitors EC2 CPU/RAM, network I/O, ALB response times, and
| Monitoring & Diagnostics |  Morgan HTTP access logs. Triggers scale-out alarms.
+--------------------------+  -------------------------------------------------------------

+--------------------------+  -------------------------------------------------------------
|     EC2 Auto Scaling     |  Maintains high availability by dynamically scaling instances
|    Elastic Scalability   |  between 2 (minimum/desired) and 4 (maximum) on CPU load (>60%).
+--------------------------+  -------------------------------------------------------------

+--------------------------+  -------------------------------------------------------------
|   AWS Backup / Snapshots |  Automated 7-day RDS backups, point-in-time recovery (PITR),
|     Disaster Recovery    |  and manual pre-exam snapshots for disaster recovery.
+--------------------------+  -------------------------------------------------------------

+--------------------------+  -------------------------------------------------------------
|        Amazon VPC        |  Provides network-level isolation, public/private subnets,
|   Network Segmentation   |  and route tables to keep databases off the public internet.
+--------------------------+  -------------------------------------------------------------

+--------------------------+  -------------------------------------------------------------
|         AWS IAM          |  Enforces least-privilege security roles for EC2 instances
|     Security & Roles     |  to access S3 and CloudWatch without hardcoded credentials.
+--------------------------+  -------------------------------------------------------------
```
