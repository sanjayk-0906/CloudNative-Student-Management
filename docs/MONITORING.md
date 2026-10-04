# Amazon CloudWatch Monitoring & Observability

## 1. Observability Overview

The CloudNative Student Platform integrates telemetry, structured logging, and health probing using **Amazon CloudWatch** to provide complete observability into compute, network, database, and application health.

---

## 2. Key Monitored Telemetry & Metrics

### 2.1 EC2 Compute & System Metrics
- `CPUUtilization`: Tracked every 1 minute. Alarms trigger if sustained > 75%.
- `NetworkIn` & `NetworkOut`: Monitored to detect abnormal traffic surges or DDoS attempts.
- `StatusCheckFailed_Instance` & `StatusCheckFailed_System`: Triggers automated instance reboot or replacement if hardware degradation occurs.
- `MemoryUtilization` & `DiskSpaceUtilization`: Collected via the CloudWatch Unified Agent (`amazon-cloudwatch-agent`).

### 2.2 Application Load Balancer Metrics
- `TargetResponseTime`: Latency (in seconds) of API calls to `/api/students`, `/api/attendance`, `/api/marks`.
- `HTTPCode_Target_2XX_Count`: Successful response counts.
- `HTTPCode_Target_5XX_Count`: Backend error count.
- `HealthyHostCount` & `UnHealthyHostCount`: Real-time inventory of active EC2 instances.

### 2.3 Amazon RDS MySQL Metrics
- `CPUUtilization`: Database compute load.
- `DatabaseConnections`: Number of active client connections from the Express connection pool.
- `FreeStorageSpace`: Storage buffer on the RDS volume.
- `ReadLatency` / `WriteLatency`: Disk I/O performance.

---

## 3. Log Aggregation (CloudWatch Logs)

The platform streams structured logs into three dedicated CloudWatch Log Groups:

1. `/aws/ec2/student-platform/application`
   - Express REST API request logs (Morgan standard format).
   - Unhandled exceptions and stack traces.
2. `/aws/ec2/student-platform/nginx-access`
   - Nginx upstream latency, remote IP, and HTTP status codes.
3. `/aws/rds/instance/student-db/error`
   - MySQL error logs, slow query logs, and deadlock reports.

---

## 4. ALB Health Check Verification

The `/api/health` endpoint serves as the definitive heartbeat for both the Application Load Balancer and external monitoring tools:

```bash
# Verify Health Endpoint
curl -i http://localhost:5000/api/health
```

**Expected Response Payload (HTTP 200 OK):**
```json
{
  "status": "healthy",
  "service": "student-management-api",
  "timestamp": "2026-10-04T10:30:00.000Z",
  "uptime": 1420.55,
  "environment": "production",
  "database": {
    "status": "connected",
    "host": "student-db.cxxxxxx.us-east-1.rds.amazonaws.com",
    "database": "student_management",
    "port": 3306
  },
  "aws": {
    "s3Configured": true,
    "region": "us-east-1",
    "s3Mode": "AWS S3 Production"
  }
}
```
