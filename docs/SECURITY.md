# Cloud Platform Security & IAM Architecture

## 1. Security Architecture Summary

The CloudNative Student Management Platform adheres to standard security compliance and defense-in-depth principles across both application code and AWS infrastructure.

---

## 2. Application Layer Security Measures

### 2.1 HTTP Security Headers (Helmet.js)
The Express backend incorporates `helmet` to automatically inject hardened HTTP response headers:
- `X-Content-Type-Options: nosniff` (Mitigates MIME-sniffing attacks)
- `X-Frame-Options: SAMEORIGIN` (Mitigates clickjacking attacks)
- `Strict-Transport-Security` (Enforces HTTPS communication)
- `Cross-Origin-Resource-Policy`

### 2.2 Cross-Origin Resource Sharing (CORS)
CORS is explicitly configured in Express middleware to restrict unauthorized domain origins while allowing standard API consumer verbs (`GET`, `POST`, `PUT`, `DELETE`).

### 2.3 Parameterized SQL Queries (SQL Injection Prevention)
Every interaction with the MySQL / AWS RDS database utilizes parameterized queries via the `mysql2/promise` prepared statement pool. Raw user input is never concatenated directly into SQL strings.
```javascript
// Secure Parameterized Query Example
const [rows] = await pool.query(
  'SELECT * FROM students WHERE register_number = ? AND department = ?',
  [registerNumber, department]
);
```

### 2.4 Strict Input Validation & HTTP Status Codes
- All API controller endpoints validate presence, data types, and value bounds (e.g. marks between 0 and 100, attendance status as `Present` or `Absent`).
- Proper semantic HTTP status codes are returned:
  - `200 OK` / `201 Created` on success.
  - `400 Bad Request` on invalid input.
  - `404 Not Found` when a student or record does not exist.
  - `500 Internal Server Error` handled gracefully by global error middleware.

---

## 3. Cloud & Infrastructure Security

### 3.1 AWS Identity & Access Management (IAM) Least Privilege
Instead of storing hardcoded long-lived access keys on EC2 instances, production deployments utilize an **IAM Instance Profile** (`StudentPlatform-EC2-Role`) with scoped IAM policies:
- `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` restricted to `arn:aws:s3:::cloudnative-student-platform-bucket/*`.
- `cloudwatch:PutMetricData`, `logs:PutLogEvents` for monitoring.
- Zero administrative permissions attached.

### 3.2 Private RDS Database Isolation
The RDS MySQL database is provisioned inside private subnets without public internet access. Inbound connections on TCP 3306 are accepted *only* from the security group of the EC2 backend instances.

### 3.3 Zero Secrets in Source Code & Frontend
All database credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`), AWS keys, and application ports are loaded dynamically from server-side environment variables (`.env`). No sensitive secrets are ever exposed in client-side frontend code or committed to Git (`.gitignore` protects `.env`).
