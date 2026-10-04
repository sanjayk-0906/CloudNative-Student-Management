# Amazon VPC & Networking Architecture

## 1. Virtual Private Cloud (VPC) Topology

The CloudNative Student Platform operates within a custom, secure Amazon VPC designed for multi-tier isolation.

```
+-----------------------------------------------------------------------------------+
|  VPC CIDR: 10.0.0.0/16                                                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  PUBLIC SUBNETS (Internet Gateway Route: 0.0.0.0/0 -> igw)                  |  |
|  |  • Public Subnet AZ-1: 10.0.1.0/24                                          |  |
|  |  • Public Subnet AZ-2: 10.0.2.0/24                                          |  |
|  |  ==> Hosts: Application Load Balancer (ALB) & NAT Gateway                   |  |
|  +-----------------------------------------------------------------------------+  |
|                                       |                                           |
|                                       v                                           |
|  +-----------------------------------------------------------------------------+  |
|  |  PRIVATE APPLICATION SUBNETS (Route: 0.0.0.0/0 -> NAT Gateway)              |  |
|  |  • Private App Subnet AZ-1: 10.0.10.0/24                                    |  |
|  |  • Private App Subnet AZ-2: 10.0.20.0/24                                    |  |
|  |  ==> Hosts: EC2 Backend Instances (Node.js + Nginx)                         |  |
|  +-----------------------------------------------------------------------------+  |
|                                       |                                           |
|                                       v                                           |
|  +-----------------------------------------------------------------------------+  |
|  |  PRIVATE DATABASE SUBNETS (Isolated - No Internet Gateway or NAT Route)    |  |
|  |  • Private DB Subnet AZ-1: 10.0.100.0/24                                    |  |
|  |  • Private DB Subnet AZ-2: 10.0.200.0/24                                    |  |
|  |  ==> Hosts: AWS RDS MySQL 8.0 Primary & Standby                             |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Subnet Details & Routing Table Configuration

| Subnet Name | CIDR Block | Availability Zone | Route Table Association | Target Gateway |
| :--- | :--- | :--- | :--- | :--- |
| `public-subnet-1a` | `10.0.1.0/24` | `us-east-1a` | Public Route Table | Internet Gateway (`igw-xxxx`) |
| `public-subnet-1b` | `10.0.2.0/24` | `us-east-1b` | Public Route Table | Internet Gateway (`igw-xxxx`) |
| `private-app-1a` | `10.0.10.0/24` | `us-east-1a` | Private App Route Table | NAT Gateway (`nat-xxxx`) |
| `private-app-1b` | `10.0.20.0/24` | `us-east-1b` | Private App Route Table | NAT Gateway (`nat-xxxx`) |
| `private-db-1a` | `10.0.100.0/24` | `us-east-1a` | Private DB Route Table | Local VPC Only (`10.0.0.0/16`) |
| `private-db-1b` | `10.0.200.0/24` | `us-east-1b` | Private DB Route Table | Local VPC Only (`10.0.0.0/16`) |

---

## 3. Security Groups (Defense-in-Depth Layering)

To satisfy zero-trust security principles, Security Groups are strictly chained such that each tier accepts inbound traffic *only* from its immediate upstream parent.

```
[INTERNET] --(Port 80/443)--> [ALB-SG] --(Port 80/5000)--> [EC2-SG] --(Port 3306)--> [RDS-SG]
```

### 3.1 ALB Security Group (`ALB-SG`)
*Attached to: Application Load Balancer*
- **Inbound Rules**:
  - `HTTP` (TCP 80) -> Source: `0.0.0.0/0` (Internet)
  - `HTTPS` (TCP 443) -> Source: `0.0.0.0/0` (Internet)
- **Outbound Rules**:
  - `All Traffic` -> Destination: `EC2-SG` (or `0.0.0.0/0`)

### 3.2 EC2 Application Security Group (`EC2-SG`)
*Attached to: EC2 Instances (Auto Scaling Group)*
- **Inbound Rules**:
  - `Custom TCP` (Port 5000) -> Source: `ALB-SG`
  - `HTTP` (Port 80) -> Source: `ALB-SG`
  - `SSH` (Port 22) -> Source: `Admin-Bastion-IP/32` (Optional for maintenance)
- **Outbound Rules**:
  - `MySQL` (Port 3306) -> Destination: `RDS-SG`
  - `HTTPS` (Port 443) -> Destination: `0.0.0.0/0` (To reach AWS S3 and CloudWatch APIs)

### 3.3 RDS Database Security Group (`RDS-SG`)
*Attached to: Amazon RDS MySQL Instance*
- **Inbound Rules**:
  - `MySQL/Aurora` (TCP 3306) -> Source: `EC2-SG` (Strictly restricted to EC2 Security Group ID)
- **Outbound Rules**:
  - `None` (Stateful response only)

> [!CAUTION]
> **Zero Public Access Enforcement**: RDS is **never** assigned a public IPv4 and never accepts port 3306 from `0.0.0.0/0`.
