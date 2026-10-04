/**
 * In-Memory Database Fallback for CloudNative Platform
 * Provides pre-seeded realistic data (12 students, attendance, marks)
 * whenever local MySQL is unavailable or credentials are pending.
 */

let students = [
  { id: 1, register_number: '21BCS101', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', phone: '+91 9876543201', department: 'CSE', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', created_at: new Date() },
  { id: 2, register_number: '21BCS102', name: 'Diya Patel', email: 'diya.patel@college.edu', phone: '+91 9876543202', department: 'CSE', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', created_at: new Date() },
  { id: 3, register_number: '21BCS103', name: 'Rohan Gupta', email: 'rohan.gupta@college.edu', phone: '+91 9876543203', department: 'CSE', year: 3, section: 'B', profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', created_at: new Date() },
  { id: 4, register_number: '21BIT201', name: 'Ananya Verma', email: 'ananya.verma@college.edu', phone: '+91 9876543204', department: 'IT', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', created_at: new Date() },
  { id: 5, register_number: '21BIT202', name: 'Karthik Raja', email: 'karthik.raja@college.edu', phone: '+91 9876543205', department: 'IT', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', created_at: new Date() },
  { id: 6, register_number: '21BEC301', name: 'Sneha Reddy', email: 'sneha.reddy@college.edu', phone: '+91 9876543206', department: 'ECE', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', created_at: new Date() },
  { id: 7, register_number: '21BEC302', name: 'Vikram Singh', email: 'vikram.singh@college.edu', phone: '+91 9876543207', department: 'ECE', year: 3, section: 'B', profile_image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', created_at: new Date() },
  { id: 8, register_number: '21BEE401', name: 'Pooja Nair', email: 'pooja.nair@college.edu', phone: '+91 9876543208', department: 'EEE', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', created_at: new Date() },
  { id: 9, register_number: '21BEE402', name: 'Arjun Menon', email: 'arjun.menon@college.edu', phone: '+91 9876543209', department: 'EEE', year: 3, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', created_at: new Date() },
  { id: 10, register_number: '21BCS104', name: 'Meera Iyer', email: 'meera.iyer@college.edu', phone: '+91 9876543210', department: 'CSE', year: 3, section: 'B', profile_image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', created_at: new Date() },
  { id: 11, register_number: '22BCS105', name: 'Rahul Desai', email: 'rahul.desai@college.edu', phone: '+91 9876543211', department: 'CSE', year: 2, section: 'A', profile_image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', created_at: new Date() },
  { id: 12, register_number: '22BIT203', name: 'Priya Sundaram', email: 'priya.sundaram@college.edu', phone: '+91 9876543212', department: 'IT', year: 2, section: 'B', profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', created_at: new Date() }
];

let attendance = [];
let marks = [];
let nextStudentId = 13;
let nextAttendanceId = 1;
let nextMarkId = 1;

// Seed Attendance Records for 10 dates
const dates = [
  '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05',
  '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'
];

// Presets: Student 3, 5, 7 have <75% attendance to demonstrate defaulter highlighting
students.forEach(s => {
  dates.forEach((d, idx) => {
    let status = 'Present';
    if (s.id === 3 && [1, 3, 5, 7].includes(idx)) status = 'Absent'; // 60%
    if (s.id === 5 && [0, 2, 4, 6, 8].includes(idx)) status = 'Absent'; // 50%
    if (s.id === 7 && [1, 3, 6, 7].includes(idx)) status = 'Absent'; // 60%
    if (s.id === 1 && idx === 4) status = 'Absent'; // 90%
    if (s.id === 4 && idx === 6) status = 'Absent'; // 90%
    if (s.id === 6 && [2, 7].includes(idx)) status = 'Absent'; // 80%
    if (s.id === 8 && idx === 3) status = 'Absent'; // 90%
    if (s.id === 9 && [4, 8].includes(idx)) status = 'Absent'; // 80%
    if (s.id === 11 && idx === 7) status = 'Absent'; // 90%
    if (s.id === 12 && [1, 7].includes(idx)) status = 'Absent'; // 80%

    attendance.push({
      id: nextAttendanceId++,
      student_id: s.id,
      date: d,
      status,
      remarks: status === 'Absent' ? 'Personal leave' : 'Regular class',
      created_at: new Date()
    });
  });
});

// Seed Marks for all 5 subjects
const subjects = [
  'Data Structures',
  'DBMS',
  'Cloud Computing',
  'Computer Networks',
  'Operating Systems'
];

const sampleScores = {
  1: [88, 92, 95, 84, 89],
  2: [94, 90, 98, 91, 93],
  3: [62, 58, 70, 55, 64],
  4: [82, 85, 88, 79, 84],
  5: [35, 42, 52, 48, 38], // Fails in DS & OS
  6: [76, 80, 84, 72, 78],
  7: [60, 65, 68, 58, 62],
  8: [89, 91, 94, 87, 90],
  9: [74, 78, 81, 70, 75],
  10: [95, 96, 99, 92, 97],
  11: [70, 75, 79, 68, 72],
  12: [85, 88, 86, 82, 84]
};

students.forEach(s => {
  const scores = sampleScores[s.id] || [75, 80, 85, 78, 82];
  subjects.forEach((sub, idx) => {
    marks.push({
      id: nextMarkId++,
      student_id: s.id,
      subject: sub,
      marks: scores[idx],
      max_marks: 100,
      semester: 5,
      exam_type: 'Semester Final',
      created_at: new Date()
    });
  });
});

module.exports = {
  getStudents: () => students,
  getAttendance: () => attendance,
  getMarks: () => marks,
  addStudent: (data) => {
    const newStudent = { id: nextStudentId++, ...data, created_at: new Date() };
    students.push(newStudent);
    // Initialize default subjects
    subjects.forEach(sub => {
      marks.push({
        id: nextMarkId++,
        student_id: newStudent.id,
        subject: sub,
        marks: 0,
        max_marks: 100,
        semester: 5,
        exam_type: 'Semester Final',
        created_at: new Date()
      });
    });
    return newStudent;
  },
  updateStudent: (id, data) => {
    const s = students.find(item => item.id === parseInt(id, 10));
    if (s) {
      Object.assign(s, data);
      return s;
    }
    return null;
  },
  deleteStudent: (id) => {
    const numId = parseInt(id, 10);
    const initialLen = students.length;
    students = students.filter(item => item.id !== numId);
    attendance = attendance.filter(item => item.student_id !== numId);
    marks = marks.filter(item => item.student_id !== numId);
    return students.length < initialLen;
  },
  recordAttendance: (data) => {
    const numId = parseInt(data.student_id, 10);
    const existing = attendance.find(a => a.student_id === numId && a.date === data.date);
    if (existing) {
      existing.status = data.status;
      if (data.remarks) existing.remarks = data.remarks;
      return existing;
    }
    const newRec = { id: nextAttendanceId++, ...data, student_id: numId, created_at: new Date() };
    attendance.push(newRec);
    return newRec;
  },
  recordMark: (data) => {
    const numId = parseInt(data.student_id, 10);
    const existing = marks.find(m => m.student_id === numId && m.subject === data.subject);
    if (existing) {
      existing.marks = parseFloat(data.marks);
      if (data.max_marks) existing.max_marks = parseFloat(data.max_marks);
      return existing;
    }
    const newMark = { id: nextMarkId++, ...data, student_id: numId, created_at: new Date() };
    marks.push(newMark);
    return newMark;
  }
};
