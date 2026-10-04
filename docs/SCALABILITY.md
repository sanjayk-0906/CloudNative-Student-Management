# Elastic Scalability & Load Balancing Architecture

## 1. High-Level Scalability Design

The CloudNative Student Management Platform achieves horizontal scalability and high availability through an **AWS Application Load Balancer (ALB)** combined with an **Amazon EC2 Auto Scaling Group (ASG)**.

```
                           INTERNET (Traffic)
                                   |
                                   v
                    [Application Load Balancer (ALB)]
                                   |
                  +----------------+----------------+
                  |                                 |
                  v                                 v
         [EC2 Instance 1]                  [EC2 Instance 2]
     (Availability Zone 1)             (Availability Zone 2)
```

---

## 2. Application Load Balancer (ALB) Configuration

- **Scheme**: Internet-facing
- **IP Address Type**: IPv4
- **Listeners**:
  - `HTTP` on Port 80 (Redirects to HTTPS 443 in production)
  - `HTTPS` on Port 443 with SSL/TLS certificate
- **Routing Algorithm**: Round Robin / Least Outstanding Requests
- **Target Group Configuration**:
  - Target Type: `Instance`
  - Protocol: `HTTP`
  - Port: `80` (or `5000` direct)
  - Health Check Path: `/api/health`
  - Health Check Protocol: `HTTP`
  - Health Check Interval: `30 seconds`
  - Healthy Threshold: `2 consecutive successes`
  - Unhealthy Threshold: `3 consecutive failures`
  - Expected Response Code: `HTTP 200`

---

## 3. Auto Scaling Group (ASG) Configuration

To dynamically absorb exam result spikes and high student traffic loads:

| Parameter | Configuration Value | Rationale |
| :--- | :--- | :--- |
| **Minimum Capacity** | `2 Instances` | Ensures high availability across 2 AZs at all times. |
| **Desired Capacity** | `2 Instances` | Baseline operating state for standard campus hours. |
| **Maximum Capacity** | `4 Instances` | Upper ceiling to handle peak result publication surges. |
| **Default Cooldown** | `180 seconds` | Prevents thrashing during scale-in / scale-out cycles. |
| **Health Check Type** | `ELB` (ALB Health Checks) | Replaces instances if `/api/health` returns non-200. |

### 3.1 Dynamic Target Tracking Scaling Policy
- **Metric**: `ASGAverageCPUUtilization`
- **Target Value**: `60%`
- **Scale-Out Behavior**: When average CPU utilization across instances exceeds 60% for 2 consecutive 1-minute evaluation periods, ASG automatically launches 1 to 2 additional EC2 instances.
- **Scale-In Behavior**: When CPU utilization drops below 40% for 5 minutes, ASG terminates surplus instances down to the baseline minimum of 2.

---

## 4. Stateless Application Tier Implementation

Horizontal auto scaling requires that backend compute nodes are **strictly stateless**:
1. **No In-Memory Session Storage**: Authentication is token/stateless or verified on request.
2. **No Local File Dependencies**: Student profile images and document uploads are pushed directly to Amazon S3 rather than instance local storage.
3. **Externalized Database**: All persistent relational state is held exclusively in Amazon RDS.
4. **Any Request Can Land on Any Instance**: A student can make a request to EC2-1 and their subsequent request can be routed to EC2-2 with zero data discrepancy.
