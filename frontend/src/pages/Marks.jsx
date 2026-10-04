import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Award,
  BarChart2
} from 'lucide-react';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { marksAPI, studentsAPI } from '../services/api';

const SUBJECTS = [
  'Data Structures',
  'DBMS',
  'Cloud Computing',
  'Computer Networks',
  'Operating Systems'
];

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'EEE'];
const YEARS = ['All', '1', '2', '3', '4'];

export default function Marks() {
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({ total_students: 0, passed_count: 0, failed_count: 0, pass_percentage: 0 });
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [alert, setAlert] = useState(null);

  // Add/Edit Marks Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [marksForm, setMarksForm] = useState({
    student_id: '',
    subject: 'Data Structures',
    marks: '',
    max_marks: '100',
    semester: '5'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMarksReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department !== 'All') params.department = department;
      if (year !== 'All') params.year = year;

      const res = await marksAPI.getSummary(params);
      if (res.success) {
        setReportData(res.data);
        setStats(res.stats);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load marks report' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentsAPI.getAll({});
      if (res.success) {
        setStudentsList(res.data);
        if (res.data.length > 0 && !marksForm.student_id) {
          setMarksForm(prev => ({ ...prev, student_id: res.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarksReport();
    fetchStudents();
  }, [department, year]);

  const handleOpenAddModal = (preselectedStudentId = null, preselectedSubject = null) => {
    setMarksForm({
      student_id: preselectedStudentId ? preselectedStudentId.toString() : (studentsList[0]?.id?.toString() || ''),
      subject: preselectedSubject || 'Data Structures',
      marks: '',
      max_marks: '100',
      semester: '5'
    });
    setIsAddModalOpen(true);
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await marksAPI.addOrUpdate({
        student_id: parseInt(marksForm.student_id, 10),
        subject: marksForm.subject,
        marks: parseFloat(marksForm.marks),
        max_marks: parseFloat(marksForm.max_marks || 100),
        semester: parseInt(marksForm.semester || 5, 10)
      });

      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Marks saved successfully.' });
        setIsAddModalOpen(false);
        fetchMarksReport();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to save marks' });
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
            Marks & Academic Results
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Record subject evaluations, compute class averages, and determine Pass/Fail status
          </p>
        </div>
        <button onClick={() => handleOpenAddModal()} className="btn btn-primary">
          <Plus size={18} />
          <span>Enter Subject Marks</span>
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Students Evaluated
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total_students}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Overall Pass Percentage
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-dark)' }}>{stats.pass_percentage}%</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Passed Students
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-dark)' }}>{stats.passed_count}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Failed Students (&lt;40)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.failed_count > 0 ? 'var(--danger-dark)' : 'var(--success-dark)' }}>
            {stats.failed_count}
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

          <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Passing Criteria: &ge; 40/100 in each course module
          </div>
        </div>
      </div>

      {/* Academic Scorecard Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Dept</th>
                <th style={{ textAlign: 'center' }}>Data Structures</th>
                <th style={{ textAlign: 'center' }}>DBMS</th>
                <th style={{ textAlign: 'center' }}>Cloud Computing</th>
                <th style={{ textAlign: 'center' }}>Computer Networks</th>
                <th style={{ textAlign: 'center' }}>Operating Systems</th>
                <th style={{ textAlign: 'center' }}>Total (/500)</th>
                <th style={{ textAlign: 'center' }}>Average %</th>
                <th style={{ textAlign: 'center' }}>Result</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Compiling academic marks...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No student marks found.
                  </td>
                </tr>
              ) : (
                reportData.map((student) => {
                  const subs = student.subjects || {};
                  return (
                    <tr key={student.student_id}>
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

                      {/* 5 Specific Subject Marks */}
                      {SUBJECTS.map((subName) => {
                        const mark = subs[subName];
                        const isGiven = mark !== undefined;
                        const isFail = isGiven && mark < 40;
                        return (
                          <td key={subName} style={{ textAlign: 'center', fontWeight: 600 }}>
                            {isGiven ? (
                              <span style={{ color: isFail ? 'var(--danger-dark)' : 'inherit' }}>
                                {mark} {isFail && '⚠️'}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>-</span>
                            )}
                          </td>
                        );
                      })}

                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{student.total_marks}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--purple)' }}>{student.average_marks}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${student.result_status === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
                          {student.result_status === 'Pass' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {student.result_status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(student.student_id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Update
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

      {/* Enter Marks Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Subject Marks"
      >
        <form onSubmit={handleMarksSubmit}>
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select
              className="form-control"
              value={marksForm.student_id}
              onChange={(e) => setMarksForm({ ...marksForm, student_id: e.target.value })}
              required
            >
              {studentsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.register_number} - {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className="form-control"
              value={marksForm.subject}
              onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })}
              required
            >
              {SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marks Obtained * (0 - 100)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                className="form-control"
                placeholder="e.g. 88.5"
                value={marksForm.marks}
                onChange={(e) => setMarksForm({ ...marksForm, marks: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Marks</label>
              <input
                type="number"
                className="form-control"
                value={marksForm.max_marks}
                onChange={(e) => setMarksForm({ ...marksForm, max_marks: e.target.value })}
                disabled
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving Marks...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
