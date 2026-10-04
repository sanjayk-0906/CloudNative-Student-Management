import React, { useState } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  CheckCircle, 
  Info, 
  ArrowDown, 
  ArrowRight,
  Globe
} from 'lucide-react';

export default function AwsArchitectureViewer() {
  const [selectedService, setSelectedService] = useState('alb');

  const awsServices = {
    alb: {
      title: 'Application Load Balancer (ALB)',
      tag: 'Scalability & High Availability',
      awsCategory: 'Networking & Content Delivery',
      icon: Globe,
      color: '#3b82f6',
      summary: 'Public-facing load balancer distributing HTTP/HTTPS traffic across multiple EC2 instances.',
      da2Mapping: 'Scalability / High Availability',
      details: [
        'Resides in Public Subnets across multiple Availability Zones.',
        'Performs active health checks via HTTP GET /api/health.',
        'Automatically stops routing traffic to failed or terminating EC2 instances.',
        'Terminates SSL/TLS certificates and forwards traffic to backend Nginx/Node.js servers.'
      ]
    },
    ec2: {
      title: 'Amazon EC2 Auto Scaling Group',
      tag: 'Compute & Stateless Backend',
      awsCategory: 'Compute',
      icon: Server,
      color: '#f59e0b',
      summary: 'Stateless Node.js Express application servers running behind Nginx reverse proxy.',
      da2Mapping: 'Compute / Scalability',
      details: [
        'Instances run in Private Subnets for enhanced zero-trust security.',
        'Min Instances: 2 | Desired: 2 | Max: 4 with dynamic CPU Target Tracking (60%).',
        'Stateless application design: sessions and file uploads are offloaded from local memory.',
        'Managed using PM2 process manager for 99.99% uptime.'
      ]
    },
    rds: {
      title: 'Amazon RDS for MySQL 8.0',
      tag: 'Managed Relational Database',
      awsCategory: 'Database',
      icon: Database,
      color: '#3b82f6',
      summary: 'Fully managed relational database storing students, attendance logs, and subject marks.',
      da2Mapping: 'Database / Persistence',
      details: [
        'Deployed strictly inside isolated Private Database Subnets.',
        'Security Group only accepts port 3306 connections originating from the EC2 Security Group.',
        'Automated Daily Backups enabled with 7-day retention window.',
        'Point-in-time recovery and manual snapshot capabilities for Disaster Recovery.'
      ]
    },
    s3: {
      title: 'Amazon S3 (Simple Storage Service)',
      tag: 'Cloud Object Storage',
      awsCategory: 'Storage',
      icon: HardDrive,
      color: '#10b981',
      summary: 'Scalable cloud object storage for student profile photos and academic documents.',
      da2Mapping: 'Storage / Unstructured Data',
      details: [
        'Stores uploaded student documents and avatar pictures.',
        'Graceful local disk fallback when running in offline/local testing mode.',
        'Bucket Versioning enabled for object protection and inadvertent deletion recovery.',
        'High durability (99.999999999% 11 9s).'
      ]
    },
    vpc: {
      title: 'Amazon VPC (Virtual Private Cloud)',
      tag: 'Network Isolation',
      awsCategory: 'Networking',
      icon: Lock,
      color: '#8b5cf6',
      summary: 'Isolated cloud network dividing architecture into Public and Private subnets.',
      da2Mapping: 'Networking / Zero Trust Isolation',
      details: [
        'VPC CIDR Block: 10.0.0.0/16.',
        'Public Subnets: 10.0.1.0/24 & 10.0.2.0/24 (Internet Gateway & ALB).',
        'Private App Subnets: 10.0.10.0/24 & 10.0.20.0/24 (EC2 instances).',
        'Private DB Subnets: 10.0.100.0/24 & 10.0.200.0/24 (RDS MySQL Database).'
      ]
    },
    security: {
      title: 'Security Groups & IAM',
      tag: 'Identity & Access Management',
      awsCategory: 'Security & Compliance',
      icon: ShieldCheck,
      color: '#ef4444',
      summary: 'Least privilege IAM roles and chained Security Groups for defense-in-depth.',
      da2Mapping: 'Security / Access Control',
      details: [
        'ALB-SG allows inbound HTTP:80 from 0.0.0.0/0.',
        'EC2-SG only allows port 5000/80 from ALB-SG (No direct public access).',
        'RDS-SG only allows port 3306 from EC2-SG (Never exposed to the internet).',
        'IAM role attached to EC2 for secure S3 and CloudWatch access without hardcoded keys.'
      ]
    },
    cloudwatch: {
      title: 'Amazon CloudWatch',
      tag: 'Monitoring & Observability',
      awsCategory: 'Management & Governance',
      icon: Activity,
      color: '#06b6d4',
      summary: 'Real-time telemetry monitoring EC2 CPU, memory, ALB response times, and Morgan logs.',
      da2Mapping: 'Monitoring / Observability',
      details: [
        'Collects CPUUtilization, NetworkIn/Out, and StatusCheckFailed metrics.',
        'Monitors /api/health target response times and 5xx error counts.',
        'Streams Express HTTP access logs (Morgan) and system errors.',
        'Triggers CloudWatch Alarms to scale EC2 instances or notify administrators.'
      ]
    },
    backup: {
      title: 'AWS Backup & Disaster Recovery',
      tag: 'Resilience & Business Continuity',
      awsCategory: 'Storage & Backup',
      icon: RotateCcw,
      color: '#ec4899',
      summary: 'Automated snapshot lifecycle and instance auto-healing procedures.',
      da2Mapping: 'Backup & Disaster Recovery',
      details: [
        'RDS Snapshot Recovery: Rapid point-in-time restore if database corruption occurs.',
        'EC2 Self-Healing: Auto Scaling automatically replaces failed EC2 instances within 2 minutes.',
        'S3 Object Versioning: Restores overwritten student documents instantly.',
        'RTO < 15 mins | RPO < 5 mins.'
      ]
    }
  };

  const active = awsServices[selectedService];

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cloud size={22} color="var(--primary)" />
            AWS Cloud-Native Architecture Map (DA2 College Project)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Click any AWS service node below to inspect its cloud role, security boundaries, and viva explanations.
          </p>
        </div>
        <span className="badge badge-primary">Public Cloud • AWS 3-Tier</span>
      </div>

      {/* Main Architectural Flow Visualization */}
      <div style={{
        background: '#0f172a',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        color: '#f8fafc',
        marginBottom: '1.5rem',
        border: '1px solid #1e293b'
      }}>
        {/* Tier 1: User & Ingress */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#1e293b',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            color: '#94a3b8',
            border: '1px solid #334155'
          }}>
            <Globe size={15} color="#60a5fa" />
            <span>INTERNET USERS (College Faculty & Students)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.4rem 0' }}>
            <ArrowDown size={18} color="#64748b" />
          </div>
        </div>

        {/* Tier 2: ALB */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div 
            onClick={() => setSelectedService('alb')}
            style={{
              background: selectedService === 'alb' ? '#1e3a8a' : '#1e293b',
              border: `2px solid ${selectedService === 'alb' ? '#3b82f6' : '#334155'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              boxShadow: selectedService === 'alb' ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          >
            <Globe size={20} color="#60a5fa" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Application Load Balancer (ALB)</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Public Subnet • Health Check: /api/health (200 OK)</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8rem', margin: '0.2rem 0' }}>
          <ArrowDown size={18} color="#64748b" />
          <ArrowDown size={18} color="#64748b" />
        </div>

        {/* Tier 3: Compute (EC2 Auto Scaling) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div 
            onClick={() => setSelectedService('ec2')}
            style={{
              flex: '1',
              maxWidth: '280px',
              background: selectedService === 'ec2' ? '#3f2c06' : '#1e293b',
              border: `2px solid ${selectedService === 'ec2' ? '#f59e0b' : '#334155'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Server size={20} color="#fbbf24" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>EC2 Backend Instance 1</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Node.js + Nginx • Port 5000</div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedService('ec2')}
            style={{
              flex: '1',
              maxWidth: '280px',
              background: selectedService === 'ec2' ? '#3f2c06' : '#1e293b',
              border: `2px solid ${selectedService === 'ec2' ? '#f59e0b' : '#334155'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Server size={20} color="#fbbf24" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>EC2 Backend Instance 2</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Auto Scaling Group (Min:2, Max:4)</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.4rem 0' }}>
          <ArrowDown size={18} color="#64748b" />
        </div>

        {/* Tier 4: Database (RDS MySQL) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div 
            onClick={() => setSelectedService('rds')}
            style={{
              background: selectedService === 'rds' ? '#1e3a8a' : '#1e293b',
              border: `2px solid ${selectedService === 'rds' ? '#3b82f6' : '#334155'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              boxShadow: selectedService === 'rds' ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          >
            <Database size={20} color="#60a5fa" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AWS RDS MySQL 8.0 Database</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Private Subnet • Port 3306 • Automated Snapshots</div>
            </div>
          </div>
        </div>

        {/* Supplementary Cloud Services Bar */}
        <div style={{
          borderTop: '1px dashed #334155',
          paddingTop: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem'
        }}>
          {[
            { key: 's3', name: 'Amazon S3', icon: HardDrive, color: '#34d399' },
            { key: 'vpc', name: 'Amazon VPC', icon: Lock, color: '#a78bfa' },
            { key: 'security', name: 'IAM & Security', icon: ShieldCheck, color: '#f87171' },
            { key: 'cloudwatch', name: 'CloudWatch', icon: Activity, color: '#22d3ee' },
            { key: 'backup', name: 'Backup & DR', icon: RotateCcw, color: '#f472b6' }
          ].map((item) => {
            const ItemIcon = item.icon;
            const isSel = selectedService === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedService(item.key)}
                style={{
                  background: isSel ? '#334155' : '#1e293b',
                  border: `1px solid ${isSel ? item.color : '#334155'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.75rem',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <ItemIcon size={16} color={item.color} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Service Detail Box */}
      <div style={{
        background: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <active.icon size={22} color={active.color} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{active.title}</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-neutral">{active.awsCategory}</span>
            <span className="badge badge-success">DA2: {active.da2Mapping}</span>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
          {active.summary}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
          {active.details.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
