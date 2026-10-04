import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  GraduationCap, 
  Building2, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Award,
  BookOpen
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AwsArchitectureViewer from '../components/AwsArchitectureViewer';
import { dashboardAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading CloudNative Dashboard analytics...</div>
      </div>
    );
  }

  const summary = stats?.summary || {
    total_students: 0,
    average_attendance: 0,
    defaulters_count: 0,
    average_marks: 0,
    total_departments: 0
  };

  const charts = stats?.charts || {
    departments: [],
    attendance_brackets: { excellent: 0, good: 0, defaulter: 0 },
    subject_averages: []
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            College Cloud Operations & Analytics
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time student performance, attendance metrics, and AWS infrastructure health
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/students" className="btn btn-primary btn-sm">
            <Users size={16} />
            <span>Manage Students</span>
          </Link>
          <Link to="/attendance" className="btn btn-secondary btn-sm">
            <CalendarCheck size={16} />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* 5 Key Metric Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={summary.total_students}
          subtext="Enrolled across all branches"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Average Attendance"
          value={`${summary.average_attendance}%`}
          subtext="Overall class attendance"
          icon={CalendarCheck}
          color="green"
        />

        <StatCard
          title="Attendance Defaulters"
          value={summary.defaulters_count}
          subtext="Students below 75% threshold"
          icon={AlertTriangle}
          color={summary.defaulters_count > 0 ? "red" : "green"}
        />

        <StatCard
          title="Average Marks"
          value={`${summary.average_marks} / 100`}
          subtext="Semester exams average"
          icon={GraduationCap}
          color="purple"
        />

        <StatCard
          title="Departments"
          value={summary.total_departments}
          subtext="CSE, IT, ECE, EEE"
          icon={Building2}
          color="amber"
        />
      </div>

      {/* Interactive AWS Cloud Architecture Viewer */}
      <AwsArchitectureViewer />

      {/* Analytics & Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* 1. Students by Department */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--primary)" />
              Students by Department
            </h3>
            <span className="badge badge-primary">{charts.departments.length} Branches</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {charts.departments.map((dept) => {
              const percentage = summary.total_students > 0 
                ? ((dept.count / summary.total_students) * 100).toFixed(0) 
                : 0;
              return (
                <div key={dept.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{dept.department} Engineering</span>
                    <span style={{ color: 'var(--text-muted)' }}>{dept.count} students ({percentage}%)</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill progress-success" 
                      style={{ width: `${percentage}%`, background: 'var(--primary)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Attendance Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--success)" />
              Attendance Compliance
            </h3>
            <span className="badge badge-neutral">75% Min Criteria</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--success-dark)' }}>Excellent (&ge; 85%)</span>
                <span>{charts.attendance_brackets.excellent} Students</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill progress-success" 
                  style={{ width: `${summary.total_students ? (charts.attendance_brackets.excellent / summary.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--warning-dark)' }}>Good (75% - 84%)</span>
                <span>{charts.attendance_brackets.good} Students</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill progress-warning" 
                  style={{ width: `${summary.total_students ? (charts.attendance_brackets.good / summary.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--danger-dark)' }}>Below 75% (Defaulter Alert)</span>
                <span>{charts.attendance_brackets.defaulter} Students</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill progress-danger" 
                  style={{ width: `${summary.total_students ? (charts.attendance_brackets.defaulter / summary.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Subject-wise Average Marks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--purple)" />
              Subject Performance
            </h3>
            <span className="badge badge-purple">5 Core Subjects</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {charts.subject_averages.map((sub) => (
              <div key={sub.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>{sub.subject}</span>
                  <span style={{ fontWeight: 700, color: 'var(--purple)' }}>{sub.average_marks} / 100</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${sub.average_marks}%`, background: 'var(--purple)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Students Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--warning)" />
              Top Academic Performers
            </h3>
            <Link to="/marks" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              View Results <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reg No</th>
                  <th>Dept</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {stats?.top_students?.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/students/${s.id}`} style={{ color: 'var(--primary)' }}>
                        {idx + 1}. {s.name}
                      </Link>
                    </td>
                    <td><code>{s.register_number}</code></td>
                    <td><span className="badge badge-neutral">{s.department}</span></td>
                    <td>
                      <span className="badge badge-success">{s.average_marks} / 100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Attendance Logs */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" />
              Recent Attendance Submissions
            </h3>
            <Link to="/attendance" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              Full Log <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Dept</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_activity?.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.student_name}</td>
                    <td><span className="badge badge-neutral">{log.department}</span></td>
                    <td>
                      <span className={`badge ${log.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
