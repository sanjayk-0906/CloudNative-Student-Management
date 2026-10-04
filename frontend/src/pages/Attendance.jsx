import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Filter, 
  Save, 
  Plus, 
  Trash2,
  Users
} from 'lucide-react';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { attendanceAPI, studentsAPI } from '../services/api';

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'EEE'];
const YEARS = ['All', '1', '2', '3', '4'];

export default function Attendance() {
  const [summaryData, setSummaryData] = useState([]);
  const [stats, setStats] = useState({ total_students: 0, defaulters_count: 0, average_attendance: 0 });
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [alert, setAlert] = useState(null);

  // Single Mark Attendance Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Bulk Attendance Mode
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkEntries, setBulkEntries] = useState({});

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department !== 'All') params.department = department;
      if (year !== 'All') params.year = year;

      const res = await attendanceAPI.getSummary(params);
      if (res.success) {
        setSummaryData(res.data);
        setStats(res.stats);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load attendance records' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await studentsAPI.getAll({});
      if (res.success) {
        setStudentsList(res.data);
        if (res.data.length > 0 && !markForm.student_id) {
          setMarkForm(prev => ({ ...prev, student_id: res.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendanceSummary();
    fetchAllStudents();
  }, [department, year]);

  const handleOpenMarkModal = (preselectedStudentId = null) => {
    setMarkForm({
      student_id: preselectedStudentId ? preselectedStudentId.toString() : (studentsList[0]?.id?.toString() || ''),
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      remarks: ''
    });
    setIsMarkModalOpen(true);
  };

  const handleOpenBulkModal = () => {
    const initialEntries = {};
    summaryData.forEach(s => {
      initialEntries[s.student_id] = 'Present';
    });
    setBulkEntries(initialEntries);
    setIsBulkModalOpen(true);
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await attendanceAPI.record({
        student_id: parseInt(markForm.student_id, 10),
        date: markForm.date,
        status: markForm.status,
        remarks: markForm.remarks
      });

      if (res.success) {
        setAlert({ type: 'success', message: 'Attendance recorded successfully.' });
        setIsMarkModalOpen(false);
        fetchAttendanceSummary();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to record attendance' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const records = Object.keys(bulkEntries).map(sId => ({
        student_id: parseInt(sId, 10),
        status: bulkEntries[sId],
        remarks: 'Daily Batch Attendance'
      }));

      const res = await attendanceAPI.record({
        date: bulkDate,
        records
      });

      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Bulk attendance updated.' });
        setIsBulkModalOpen(false);
        fetchAttendanceSummary();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to record bulk attendance' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Attendance Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Daily attendance logging, 75% shortage monitoring, and aggregate percentages
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleOpenBulkModal} className="btn btn-secondary">
            <CalendarCheck size={18} />
            <span>Mark Daily Class Batch</span>
          </button>
          <button onClick={() => handleOpenMarkModal()} className="btn btn-primary">
            <Plus size={18} />
            <span>Mark Student</span>
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Top Stat Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Monitored Students
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total_students}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Batch Average Attendance
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-dark)' }}>{stats.average_attendance}%</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Shortage Defaulters (&lt; 75%)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.defaulters_count > 0 ? 'var(--danger-dark)' : 'var(--success-dark)' }}>
            {stats.defaulters_count} Students
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Filter size={16} color="var(--text-muted)" />
            <span>Filter Department:</span>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Filter Year:</span>
            <select
              className="form-control"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
            >
              {YEARS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--danger-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={15} />
            <span>Rows highlighted in red indicate attendance &lt; 75% (Defaulter)</span>
          </div>
        </div>
      </div>

      {/* Attendance Summary Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year / Sec</th>
                <th style={{ textAlign: 'center' }}>Total Classes</th>
                <th style={{ textAlign: 'center' }}>Present</th>
                <th style={{ textAlign: 'center' }}>Absent</th>
                <th>Attendance %</th>
                <th>Compliance Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Calculating attendance metrics...
                  </td>
                </tr>
              ) : summaryData.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                summaryData.map((student) => {
                  const isDefaulter = student.is_defaulter;
                  return (
                    <tr key={student.student_id} className={isDefaulter ? 'highlight-defaulter' : ''}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                          {student.register_number}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/students/${student.student_id}`} style={{ color: 'var(--text-main)' }}>
                          {student.student_name}
                        </Link>
                      </td>
                      <td><span className="badge badge-neutral">{student.department}</span></td>
                      <td>Year {student.year} - {student.section}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{student.total_classes}</td>
                      <td style={{ textAlign: 'center', color: 'var(--success-dark)', fontWeight: 700 }}>{student.present_count}</td>
                      <td style={{ textAlign: 'center', color: 'var(--danger-dark)', fontWeight: 700 }}>{student.absent_count}</td>
                      <td style={{ width: '170px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar-container" style={{ flex: 1 }}>
                            <div 
                              className={`progress-bar-fill ${isDefaulter ? 'progress-danger' : 'progress-success'}`}
                              style={{ width: `${Math.min(student.attendance_percentage, 100)}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, width: '42px', textAlign: 'right' }}>
                            {student.attendance_percentage}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {isDefaulter ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={12} /> Defaulter (&lt;75%)
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Eligible
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenMarkModal(student.student_id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Mark Today
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Mark Attendance Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Record Student Attendance"
      >
        <form onSubmit={handleMarkSubmit}>
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select
              className="form-control"
              value={markForm.student_id}
              onChange={(e) => setMarkForm({ ...markForm, student_id: e.target.value })}
              required
            >
              {studentsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.register_number} - {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                value={markForm.date}
                onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                value={markForm.status}
                onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. On-duty, medical leave, lab session"
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsMarkModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Recording...' : 'Submit Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Mark Attendance Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Mark Daily Class Batch Attendance"
        size="lg"
      >
        <form onSubmit={handleBulkSubmit}>
          <div className="form-group" style={{ maxWidth: '240px', marginBottom: '1.25rem' }}>
            <label className="form-label">Attendance Date *</label>
            <input
              type="date"
              className="form-control"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              required
            />
          </div>

          <div className="table-responsive" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Dept</th>
                  <th>Status Toggle</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map(s => {
                  const currentStatus = bulkEntries[s.student_id] || 'Present';
                  return (
                    <tr key={s.student_id}>
                      <td><code>{s.register_number}</code></td>
                      <td style={{ fontWeight: 600 }}>{s.student_name}</td>
                      <td><span className="badge badge-neutral">{s.department}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setBulkEntries(prev => ({ ...prev, [s.student_id]: 'Present' }))}
                            className={`btn btn-sm ${currentStatus === 'Present' ? 'btn-success' : 'btn-secondary'}`}
                          >
                            <CheckCircle2 size={14} /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setBulkEntries(prev => ({ ...prev, [s.student_id]: 'Absent' }))}
                            className={`btn btn-sm ${currentStatus === 'Absent' ? 'btn-danger' : 'btn-secondary'}`}
                          >
                            <XCircle size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsBulkModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving Batch...' : 'Save All Records'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
