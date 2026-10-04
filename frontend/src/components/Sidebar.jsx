import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  Cloud, 
  LogOut, 
  Server, 
  Database,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Layers size={22} />
        </div>
        <div>
          <div className="sidebar-title">CloudNative</div>
          <div className="sidebar-subtitle">DA2 Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Academic Modules</div>
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/students" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={19} />
          <span>Students</span>
        </NavLink>

        <NavLink 
          to="/attendance" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <CalendarCheck size={19} />
          <span>Attendance</span>
        </NavLink>

        <NavLink 
          to="/marks" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <GraduationCap size={19} />
          <span>Marks & Results</span>
        </NavLink>

        <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>Cloud Infrastructure</div>

        <NavLink 
          to="/architecture" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Cloud size={19} />
          <span>AWS Architecture</span>
        </NavLink>
      </nav>

      {/* Cloud Status & Footer */}
      <div className="sidebar-footer">
        <div className="aws-badge-pill" style={{ marginBottom: '0.75rem' }}>
          <div className="aws-dot"></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>AWS Public Cloud</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>ALB • EC2 • RDS • S3</div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="btn btn-secondary" 
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            borderColor: '#334155',
            fontSize: '0.82rem',
            padding: '0.45rem 0.75rem'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
