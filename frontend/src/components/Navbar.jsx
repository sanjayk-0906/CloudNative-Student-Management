import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Cloud, HardDrive } from 'lucide-react';
import { healthAPI } from '../services/api';

export default function Navbar({ title }) {
  const [health, setHealth] = useState({
    status: 'checking',
    environment: 'Local Development',
    deployment_type: 'Localhost',
    database: { status: 'checking', label: 'Checking...' },
    aws: { s3Configured: false, s3Label: 'Local Demo Mode' }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const res = await healthAPI.getHealth();
        if (isMounted) setHealth(res);
      } catch (err) {
        if (isMounted) {
          setHealth({
            status: 'unreachable',
            environment: 'Local Development',
            deployment_type: 'Localhost',
            database: { status: 'disconnected', label: 'Offline' },
            aws: { s3Configured: false, s3Label: 'Offline' }
          });
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isHealthy = health.status === 'healthy';
  const isDbOnline = health.database?.status === 'connected';
  const isAwsProduction = health.environment === 'AWS Production';
  const isS3Connected = health.aws?.s3Configured;

  return (
    <header className="navbar">
      <div className="navbar-title">
        <span>{title}</span>
      </div>

      <div className="navbar-actions">
        {/* Environment / ALB Status */}
        <div 
          className={`health-status-badge ${isHealthy ? 'healthy' : 'warning'}`}
          title={`Backend API Status: ${health.status} (${health.environment})`}
        >
          <Activity size={15} style={{ animation: 'pulse 2s infinite' }} />
          <span>
            {isAwsProduction ? 'ALB: 200 OK' : 'LOCAL: HEALTHY'}
          </span>
        </div>

        {/* Dynamic Database Status */}
        <div 
          className={`health-status-badge ${isDbOnline ? 'healthy' : 'warning'}`}
          title={`Database: ${isDbOnline ? 'MySQL / AWS RDS Online' : 'Offline / Fallback mode'} (Host: ${health.database?.host || 'localhost'})`}
          style={{ cursor: 'pointer' }}
        >
          <Database size={14} color={isDbOnline ? 'var(--success-dark)' : 'var(--warning-dark)'} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            DB: {isDbOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Dynamic S3 Status */}
        <div 
          className="health-status-badge"
          style={{
            background: isS3Connected ? 'var(--success-light)' : 'var(--secondary-light)',
            color: isS3Connected ? 'var(--success-dark)' : 'var(--secondary)',
            borderColor: isS3Connected ? '#a7f3d0' : 'var(--border-color)'
          }}
          title={isS3Connected ? `Connected to AWS S3 Bucket: ${health.aws?.bucket}` : 'Operating in Local Storage Fallback Mode'}
        >
          <HardDrive size={14} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {isS3Connected ? 'AWS S3 Connected' : 'Local Demo Mode'}
          </span>
        </div>

        {/* User Pill */}
        <div className="user-profile-badge">
          <div className="avatar-circle">AD</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>Admin User</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Faculty / HOD</div>
          </div>
        </div>
      </div>
    </header>
  );
}
