import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Layers, 
  RotateCcw, 
  CheckCircle2, 
  RefreshCw,
  Terminal,
  ExternalLink
} from 'lucide-react';
import AwsArchitectureViewer from '../components/AwsArchitectureViewer';
import { healthAPI } from '../services/api';

export default function Architecture() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkLiveHealth = async () => {
    try {
      setLoading(true);
      const data = await healthAPI.getHealth();
      setHealthData(data);
    } catch (err) {
      setHealthData({
        status: 'unreachable',
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLiveHealth();
  }, []);

  const da2Mappings = [
    {
      requirement: '1. Deployment Model',
      concept: 'Public Cloud',
      service: 'Amazon Web Services (AWS)',
      implementation: 'Deployed on AWS public cloud infrastructure utilizing multi-AZ resiliency (ALB, EC2, RDS, S3).'
    },
    {
      requirement: '2. Database',
      concept: 'Managed Relational DB',
      service: 'Amazon RDS (MySQL 8.0)',
      implementation: 'student_management DB with tables (students, attendance, marks) in private subnet with automated backups.'
    },
    {
      requirement: '3. Storage',
      concept: 'Object Storage',
      service: 'Amazon S3',
      implementation: 'Stores student profile photos and academic certificates with local fallback and bucket versioning.'
    },
    {
      requirement: '4. Networking',
      concept: 'VPC & Subnet Isolation',
      service: 'Amazon VPC',
      implementation: 'VPC (10.0.0.0/16) with Public subnets for ALB and Private subnets for EC2 and RDS + Internet Gateway.'
    },
    {
      requirement: '5. Security',
      concept: 'Zero Trust & Least Privilege',
      service: 'AWS IAM & Security Groups',
      implementation: 'Layered Security Groups (ALB-SG -> EC2-SG -> RDS-SG). Private RDS is never exposed to 0.0.0.0/0.'
    },
    {
      requirement: '6. Scalability',
      concept: 'Horizontal Auto Scaling',
      service: 'EC2 Auto Scaling & ALB',
      implementation: 'Stateless Node.js backend with Auto Scaling Group (Min: 2, Max: 4) scaling on CPU threshold (>60%).'
    },
    {
      requirement: '7. Monitoring',
      concept: 'Metrics & Logging',
      service: 'Amazon CloudWatch',
      implementation: 'Monitors EC2 CPU/RAM, ALB request counts, Morgan HTTP logs, and active /api/health target checks.'
    },
    {
      requirement: '8. Backup',
      concept: 'Automated Retention & Snapshots',
      service: 'Amazon RDS Automated Backups',
      implementation: '7-day automated backup retention window, point-in-time recovery, and manual snapshot creation.'
    },
    {
      requirement: '9. Disaster Recovery',
      concept: 'Self-Healing & Rapid Restore',
      service: 'RDS Snapshot Restore + ASG',
      implementation: 'Runbook to restore RDS from snapshot (<15 min RTO) and automatic EC2 instance replacement via ASG.'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            AWS Cloud-Native Architecture & DA2 Design
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Comprehensive mapping of college DA2 cloud criteria against AWS production services
          </p>
        </div>
        <button onClick={checkLiveHealth} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Ping /api/health</span>
        </button>
      </div>

      {/* Main Interactive Diagram */}
      <AwsArchitectureViewer />

      {/* Live ALB Health Endpoint Telemetry */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--primary)" />
            Live Load Balancer Health Check Telemetry (/api/health)
          </h3>
          <span className="badge badge-success">HTTP 200 OK Status</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          The AWS Application Load Balancer polls this endpoint every 30 seconds to evaluate EC2 instance health before routing student traffic.
        </p>

        <div style={{
          background: '#0f172a',
          color: '#38bdf8',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          overflowX: 'auto',
          border: '1px solid #1e293b'
        }}>
          <pre>{JSON.stringify(healthData, null, 2)}</pre>
        </div>
      </div>

      {/* DA2 Requirement Mapping Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary)" />
            DA2 Syllabus & Cloud Evaluation Matrix
          </h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>DA2 Requirement</th>
                <th>Cloud Architecture Concept</th>
                <th>AWS Service Employed</th>
                <th>Platform Implementation</th>
              </tr>
            </thead>
            <tbody>
              {da2Mappings.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.requirement}</td>
                  <td style={{ fontWeight: 600 }}>{row.concept}</td>
                  <td>
                    <span className="badge badge-primary">{row.service}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{row.implementation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Security & Networking Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="var(--purple)" />
              VPC Network Topology
            </h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>VPC CIDR:</strong> 10.0.0.0/16 (Default isolated campus cloud network).</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Public Subnet:</strong> Houses Application Load Balancer with Internet Gateway route (0.0.0.0/0 -&gt; igw).</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Private App Subnet:</strong> Houses stateless EC2 instances (No direct public IPv4).</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Private DB Subnet:</strong> Houses RDS MySQL DB (Strict isolation, no internet route).</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--danger)" />
              Security Groups Rule Chain
            </h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>ALB-SG:</strong> Inbound Port 80 (HTTP) & 443 (HTTPS) from 0.0.0.0/0.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>EC2-SG:</strong> Inbound Port 5000/80 strictly allowed ONLY from ALB-SG.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>RDS-SG:</strong> Inbound Port 3306 strictly allowed ONLY from EC2-SG. (Never 0.0.0.0/0).</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>App Security:</strong> Helmet HTTP headers, CORS whitelisting, and SQL parameterized queries.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
