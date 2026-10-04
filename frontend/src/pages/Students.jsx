import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  UploadCloud, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { studentsAPI } from '../services/api';

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'EEE'];
const YEARS = ['All', '1', '2', '3', '4'];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [alert, setAlert] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    register_number: '',
    name: '',
    email: '',
    phone: '',
    department: 'CSE',
    year: '3',
    section: 'A'
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (year !== 'All') params.year = year;

      const res = await studentsAPI.getAll(params);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, year]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenAddModal = () => {
    setFormData({
      register_number: '',
      name: '',
      email: '',
      phone: '',
      department: 'CSE',
      year: '3',
      section: 'A'
    });
    setProfileImageFile(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      register_number: student.register_number,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year.toString(),
      section: student.section
    });
    setProfileImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (profileImageFile) {
        data.append('profile_image', profileImageFile);
      }

      const res = await studentsAPI.create(data);
      if (res.success) {
        setAlert({ type: 'success', message: `Student '${formData.name}' created successfully.` });
        setIsAddModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create student' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      setFormSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (profileImageFile) {
        data.append('profile_image', profileImageFile);
      }

      const res = await studentsAPI.update(selectedStudent.id, data);
      if (res.success) {
        setAlert({ type: 'success', message: `Student '${formData.name}' updated successfully.` });
        setIsEditModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update student' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setFormSubmitting(true);
      const res = await studentsAPI.delete(selectedStudent.id);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Student deleted successfully.' });
        setIsDeleteModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete student' });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Student Management Directory
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Add, search, edit, and manage student profiles and cloud credentials
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1', minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, register number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
              <Filter size={15} color="var(--text-muted)" />
              <span>Dept:</span>
              <select 
                className="form-control" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.6rem' }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>Year:</span>
              <select 
                className="form-control" 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.6rem' }}
              >
                {YEARS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year / Sec</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Attendance</th>
                <th>Avg Marks</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No student records found matching the query.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const attPct = Number(student.attendance_percentage || 0);
                  const isDefaulter = attPct < 75.0 && Number(student.total_classes) > 0;
                  return (
                    <tr key={student.id} className={isDefaulter ? 'highlight-defaulter' : ''}>
                      <td>#{student.id}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                          {student.register_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={student.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={student.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                            }}
                          />
                          <Link to={`/students/${student.id}`} style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {student.name}
                          </Link>
                        </div>
                      </td>
                      <td><span className="badge badge-neutral">{student.department}</span></td>
                      <td>Year {student.year} - {student.section}</td>
                      <td style={{ fontSize: '0.82rem' }}>{student.email}</td>
                      <td style={{ fontSize: '0.82rem' }}>{student.phone}</td>
                      <td>
                        <span className={`badge ${isDefaulter ? 'badge-danger' : 'badge-success'}`}>
                          {attPct}% {isDefaulter && '(Defaulter)'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple">
                          {student.average_marks ? `${student.average_marks}/100` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <Link 
                            to={`/students/${student.id}`} 
                            className="btn btn-secondary btn-icon btn-sm"
                            title="View Student Profile"
                          >
                            <Eye size={15} color="var(--primary)" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Edit Student"
                          >
                            <Edit2 size={15} color="var(--warning-dark)" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(student)}
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Delete Student"
                          >
                            <Trash2 size={15} color="var(--danger)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student (AWS Cloud Register)"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Register Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 21BCS108"
                value={formData.register_number}
                onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Siddharth Verma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <select
                className="form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section *</label>
              <input
                type="text"
                className="form-control"
                placeholder="A / B / C"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UploadCloud size={16} color="var(--primary)" />
              Profile Photo / Document (Amazon S3 Upload)
            </label>
            <input
              type="file"
              className="form-control"
              accept="image/*,application/pdf"
              onChange={(e) => setProfileImageFile(e.target.files[0])}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Uploaded to AWS S3 bucket (or local storage fallback if AWS keys are not configured).
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Saving Student...' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student: ${selectedStudent?.name} (${selectedStudent?.register_number})`}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Register Number *</label>
              <input
                type="text"
                className="form-control"
                value={formData.register_number}
                onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <select
                className="form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section *</label>
              <input
                type="text"
                className="form-control"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UploadCloud size={16} color="var(--primary)" />
              Update Profile Photo (AWS S3)
            </label>
            <input
              type="file"
              className="form-control"
              accept="image/*,application/pdf"
              onChange={(e) => setProfileImageFile(e.target.files[0])}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Deletion"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Are you sure you want to delete student <strong>{selectedStudent?.name}</strong> ({selectedStudent?.register_number})?
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--danger-dark)', background: 'var(--danger-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            ⚠️ This will cascade delete all corresponding attendance records and subject marks from the database.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleDeleteSubmit} disabled={formSubmitting} className="btn btn-danger">
            {formSubmitting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
