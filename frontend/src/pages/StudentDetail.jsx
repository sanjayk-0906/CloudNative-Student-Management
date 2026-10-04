import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  CalendarCheck, 
  GraduationCap, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Award,
  Layers
} from 'lucide-react';
import Alert from '../components/Alert';
import { studentsAPI } from '../services/api';

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await studentsAPI.getById(id);
      if (res.success) {
        setStudent(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch student details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await studentsAPI.uploadPhoto(id, file);
      if (res.success) {
        setAlert({ 
          type: 'success', 
          message: `${res.message} (${res.storage})` 
        });
        fetchStudent();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to upload photo' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading student details...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ padding: '2rem' }}>
        <Alert type="error" message="Student not found." />
        <Link to="/students" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    );
  }

  const att = student.attendance_summary || { total_classes: 0, present_classes: 0, absent_classes: 0, percentage: 0 };
  const marksSummary = student.marks_summary || { total_marks: 0, average_marks: 0, result_status: 'Pending' };

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/students" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={15} />
          <span>Back to Students List</span>
        </Link>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Student Profile Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar and S3 Upload Button */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <img
              src={student.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={student.name}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: 'var(--shadow-md)'
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
              }}
            />
            <div style={{ marginTop: '0.65rem' }}>
              <label 
                className="btn btn-secondary btn-sm" 
                style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                <UploadCloud size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload S3 Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Core Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{student.name}</h1>
              <span className="badge badge-primary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                {student.register_number}
              </span>
              <span className="badge badge-neutral">{student.department} Engineering</span>
              <span className="badge badge-purple">Year {student.year} - Sec {student.section}</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={16} color="var(--primary)" />
                <span>{student.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={16} color="var(--primary)" />
                <span>{student.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="var(--primary)" />
                <span>Registered: {new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Result Status Badge */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Academic Status
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: marksSummary.result_status === 'Pass' ? 'var(--success-dark)' : 'var(--danger-dark)',
              marginTop: '0.2rem'
            }}>
              {marksSummary.result_status}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Avg: {marksSummary.average_marks} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Attendance & Marks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Attendance Card & History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarCheck size={20} color="var(--success)" />
              Attendance Performance
            </h2>
            <span className={`badge ${att.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
              {att.percentage}% Overall
            </span>
          </div>

          {att.is_defaulter && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid #fecaca',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-dark)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={16} />
              <span><strong>Attendance Shortage Alert:</strong> Below mandatory 75% college threshold.</span>
            </div>
          )}

          {/* Metrics summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{att.total_classes}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Classes</div>
            </div>
            <div style={{ background: 'var(--success-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-dark)' }}>{att.present_classes}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--success-dark)', textTransform: 'uppercase' }}>Present</div>
            </div>
            <div style={{ background: 'var(--danger-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger-dark)' }}>{att.absent_classes}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--danger-dark)', textTransform: 'uppercase' }}>Absent</div>
            </div>
          </div>

          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Attendance Date Records</h3>
          <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance_records?.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                      No attendance recorded yet.
                    </td>
                  </tr>
                ) : (
                  student.attendance_records?.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Marks Card & Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="var(--purple)" />
              Semester Examination Marks
            </h2>
            <span className="badge badge-purple">
              Total: {marksSummary.total_marks} / 500
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--purple)' }}>{marksSummary.average_marks}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subjects Evaluated</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{student.marks_records?.length || 0} / 5</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Result</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: marksSummary.result_status === 'Pass' ? 'var(--success-dark)' : 'var(--danger-dark)' }}>
                {marksSummary.result_status}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Subject Scorecard</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Max</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.marks_records?.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                      No marks recorded yet.
                    </td>
                  </tr>
                ) : (
                  student.marks_records?.map((mark) => {
                    const passed = Number(mark.marks) >= 40;
                    return (
                      <tr key={mark.id}>
                        <td style={{ fontWeight: 600 }}>{mark.subject}</td>
                        <td style={{ fontWeight: 700 }}>{Number(mark.marks)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{Number(mark.max_marks)}</td>
                        <td>
                          <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                            {passed ? 'Pass' : 'Fail (<40)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
