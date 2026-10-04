# Backup Strategies & Disaster Recovery (DR) Runbook

## 1. Backup Strategies Overview

Data protection in the CloudNative Student Management Platform is distributed across structured database storage (RDS) and unstructured object storage (S3).

---

## 2. Backup Mechanisms

### 2.1 Amazon RDS Automated Backups & Snapshots
- **Automated Daily Backups**: AWS RDS captures a continuous transaction log stream and daily storage snapshots automatically during a designated 30-minute backup window.
- **Backup Retention Period**: Configured to `7 days` (expandable up to 35 days).
- **Point-in-Time Recovery (PITR)**: Enables rolling back the database to any specific second within the retention window (e.g. before an erroneous batch delete).
- **Manual RDS DB Snapshots**: Taken before major software updates or semester result publishing. Manual snapshots are retained indefinitely until explicitly deleted.

### 2.2 Amazon S3 Versioning & Lifecycle
- **Bucket Versioning**: Enabled on the student documents/photo bucket (`cloudnative-student-platform-bucket`).
- **Object Protection**: When a file is modified or deleted, S3 creates a version marker rather than permanently erasing data. Any previous version of a student document can be restored with a single API call.

---

## 3. Disaster Recovery Scenarios & Runbooks

```
+-----------------------------------------------------------------------------------------+
|                               DISASTER RECOVERY MATRIX                                  |
+---------------------+-------------------+---------------------+-------------------------+
| Failure Domain      | Detection Time    | Recovery Action     | Target RTO / RPO        |
+---------------------+-------------------+---------------------+-------------------------+
| RDS Database Crash  | < 1 Minute        | Restore Snapshot    | RTO < 15 min / RPO < 5m |
| EC2 Instance Crash  | < 2 Minutes (ALB) | ASG Auto-Replace    | RTO < 2 min / RPO = 0   |
| Corrupted S3 Object | Immediate         | S3 Version Rollback | RTO < 1 min / RPO = 0   |
+---------------------+-------------------+---------------------+-------------------------+
```

---

### Scenario 1: Amazon RDS Database Failure or Data Corruption

**Step-by-Step Recovery Procedure:**

1. **Identify the Failure**: CloudWatch Alarm triggers on `DatabaseConnections == 0` or `/api/health` indicates `database.status: "disconnected"`.
2. **Navigate to AWS Console**: Go to **RDS Console** -> **Snapshots** (or **Automated Backups**).
3. **Restore Database from Snapshot**:
   - Select the latest healthy snapshot (e.g. `student-db-manual-snap-final`).
   - Click **Actions** -> **Restore snapshot**.
   - Specify a new DB Instance Identifier (e.g. `student-db-restored`).
   - Keep the same VPC, Subnet Group, and Security Group (`RDS-SG`).
   - Click **Restore DB Instance**.
4. **Obtain Restored Endpoint**: Once status is *Available*, copy the newly assigned endpoint (e.g. `student-db-restored.cxxxxxx.us-east-1.rds.amazonaws.com`).
5. **Update Backend Configuration**:
   - SSH into the EC2 instances (or update AWS Systems Manager Parameter Store).
   - Update `DB_HOST` in `/var/www/student-platform/.env`:
     ```env
     DB_HOST=student-db-restored.cxxxxxx.us-east-1.rds.amazonaws.com
     ```
6. **Restart Backend Application**:
   ```bash
   pm2 restart student-backend
   ```
7. **Verify Service Health**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Ensure `database.status` returns `"connected"`.
8. **Verify Student Data Integrity**: Access the frontend `/dashboard` and `/students` to confirm all 12 student records, attendance logs, and marks are restored.

---

### Scenario 2: EC2 Instance Failure / Crash

**Automated Recovery Procedure:**

1. **Failure Detection**: An EC2 instance crashes due to kernel panic, process death, or hardware degradation.
2. **ALB Target Group Health Check**: ALB detects that the instance fails 2 consecutive health checks (`/api/health`).
3. **Traffic Evacuation**: ALB immediately ceases sending new student requests to the faulty instance. Active traffic is routed exclusively to the healthy peer instance in the other AZ.
4. **Auto Scaling Self-Healing**: Auto Scaling Group receives the unhealthy status notification, terminates the failed instance, and automatically provisions a new EC2 instance from the Launch Template.
5. **Bootstrap & Joining**: The new instance executes `setup-ec2.sh` / `start-server.sh`, passes `/api/health`, and is automatically registered into the ALB target group.
6. **Zero Downtime**: Users and examiners experience zero service disruption during the entire replacement cycle.
