import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, User, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Alert from '../components/Alert';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // College demo credentials
      if (username.trim() === 'admin' && password === 'admin123') {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setError('Invalid username or password. Demo credentials: admin / admin123');
      }
      setLoading(false);
    }, 400);
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '1rem',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
          }}>
            <Layers size={30} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            CloudNative Student Platform
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
            AWS Cloud Computing DA2 Project Demonstration
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} color="var(--primary)" />
              Username
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={15} color="var(--primary)" />
              Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <Lock size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
          >
            ⚡ Auto-Fill Demo Credentials (admin / admin123)
          </button>

          <div style={{
            marginTop: '1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.75rem',
            color: '#64748b',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              <strong>Security Notice:</strong> AWS credentials (RDS, S3, IAM) are managed securely on the backend via environment variables and never exposed to the client.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
