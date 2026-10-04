const mysql = require('mysql2/promise');
const path = require('path');
const inMemoryDb = require('../db/inMemoryDb');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let rawPool = null;
let isDbConnected = false;

try {
  rawPool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('[DB Warning] MySQL pool initialization error:', err.message);
}

// Helper to check DB connectivity
async function checkDatabaseConnection() {
  if (!rawPool) {
    return {
      connected: false,
      mode: 'In-Memory Mock (Offline Fallback)',
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    };
  }

  try {
    const connection = await rawPool.getConnection();
    await connection.ping();
    connection.release();
    isDbConnected = true;
    return {
      connected: true,
      mode: 'MySQL / AWS RDS Production',
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    };
  } catch (error) {
    isDbConnected = false;
    return {
      connected: false,
      mode: 'In-Memory Mock (Offline Fallback)',
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port,
      error: error.message
    };
  }
}

/**
 * Universal query wrapper that runs real SQL against MySQL / RDS,
 * or serves data from inMemoryDb if MySQL is offline.
 */
const pool = {
  query: async (sql, params = []) => {
    // Attempt MySQL query if connected
    if (isDbConnected && rawPool) {
      try {
        return await rawPool.query(sql, params);
      } catch (err) {
        console.warn(`[MySQL Error] ${err.message}. Falling back to in-memory dataset.`);
      }
    }

    // Fallback in-memory handler for queries
    const normalizedSql = sql.trim().toLowerCase();

    // 1. Health check / ping
    if (normalizedSql.includes('select 1')) {
      return [[{ '1': 1 }]];
    }

    // 2. Count students
    if (normalizedSql.includes('count(*) as total_students')) {
      return [[{ total_students: inMemoryDb.getStudents().length }]];
    }

    // 3. Dept distribution
    if (normalizedSql.includes('group by department')) {
      const counts = {};
      inMemoryDb.getStudents().forEach(s => {
        counts[s.department] = (counts[s.department] || 0) + 1;
      });
      const rows = Object.keys(counts).map(dept => ({
        department: dept,
        count: counts[dept]
      })).sort((a, b) => b.count - a.count);
      return [rows];
    }

    // 4. Avg marks overall
    if (normalizedSql.includes('avg(marks) as avg_marks')) {
      const allMarks = inMemoryDb.getMarks();
      const avg = allMarks.length > 0 
        ? (allMarks.reduce((sum, m) => sum + m.marks, 0) / allMarks.length).toFixed(2)
        : 0;
      return [[{ avg_marks: avg }]];
    }

    // 5. Subject averages
    if (normalizedSql.includes('group by subject')) {
      const allMarks = inMemoryDb.getMarks();
      const subjects = ['Data Structures', 'DBMS', 'Cloud Computing', 'Computer Networks', 'Operating Systems'];
      const rows = subjects.map(sub => {
        const subMarks = allMarks.filter(m => m.subject === sub);
        const avg = subMarks.length > 0 
          ? (subMarks.reduce((sum, m) => sum + m.marks, 0) / subMarks.length).toFixed(2) 
          : 0;
        return {
          subject: sub,
          average_marks: Number(avg),
          min_marks: subMarks.length > 0 ? Math.min(...subMarks.map(m => m.marks)) : 0,
          max_marks: subMarks.length > 0 ? Math.max(...subMarks.map(m => m.marks)) : 0,
          evaluations_count: subMarks.length
        };
      });
      return [rows];
    }

    // 6. Recent attendance logs
    if (normalizedSql.includes('from attendance a') && normalizedSql.includes('limit 5')) {
      const allAttendance = inMemoryDb.getAttendance();
      const allStudents = inMemoryDb.getStudents();
      const rows = allAttendance.slice(-5).reverse().map(a => {
        const s = allStudents.find(item => item.id === a.student_id) || {};
        return {
          id: a.id,
          date: a.date,
          status: a.status,
          student_name: s.name || 'Student',
          register_number: s.register_number || 'REG',
          department: s.department || 'CSE'
        };
      });
      return [rows];
    }

    // 7. Top students
    if (normalizedSql.includes('from students s') && normalizedSql.includes('limit 5')) {
      const allStudents = inMemoryDb.getStudents();
      const allMarks = inMemoryDb.getMarks();
      const rows = allStudents.map(s => {
        const sm = allMarks.filter(m => m.student_id === s.id);
        const avg = sm.length > 0 ? (sm.reduce((acc, curr) => acc + curr.marks, 0) / sm.length).toFixed(2) : 0;
        return {
          id: s.id,
          register_number: s.register_number,
          name: s.name,
          department: s.department,
          profile_image_url: s.profile_image_url,
          average_marks: Number(avg)
        };
      }).sort((a, b) => b.average_marks - a.average_marks).slice(0, 5);
      return [rows];
    }

    // 8. Select students with calculated attendance & marks
    if (normalizedSql.includes('from students s') && normalizedSql.includes('left join attendance')) {
      const allStudents = inMemoryDb.getStudents();
      const allAtt = inMemoryDb.getAttendance();
      const allMarks = inMemoryDb.getMarks();

      let filtered = [...allStudents];
      if (params.length > 0) {
        const searchTerm = params[0] ? params[0].toString().replace(/%/g, '').toLowerCase() : '';
        if (searchTerm) {
          filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchTerm) || 
            s.register_number.toLowerCase().includes(searchTerm) ||
            s.email.toLowerCase().includes(searchTerm)
          );
        }
      }

      const rows = filtered.map(s => {
        const sAtt = allAtt.filter(a => a.student_id === s.id);
        const sMarks = allMarks.filter(m => m.student_id === s.id);
        const total = sAtt.length;
        const present = sAtt.filter(a => a.status === 'Present').length;
        const attPct = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;
        const avgMarks = sMarks.length > 0 ? Number((sMarks.reduce((acc, curr) => acc + curr.marks, 0) / sMarks.length).toFixed(2)) : 0;

        return {
          ...s,
          total_classes: total,
          present_count: present,
          attendance_percentage: attPct,
          average_marks: avgMarks
        };
      });

      return [rows];
    }

    // 9. Single student by ID
    if (normalizedSql.includes('from students where id = ?') || normalizedSql.includes('from students s where s.id = ?')) {
      const studentId = parseInt(params[0], 10);
      const student = inMemoryDb.getStudents().find(s => s.id === studentId);
      return [student ? [student] : []];
    }

    // 10. Check duplicate student
    if (normalizedSql.includes('where register_number = ? or email = ?')) {
      const reg = params[0];
      const em = params[1];
      const match = inMemoryDb.getStudents().find(s => s.register_number === reg || s.email === em);
      return [match ? [match] : []];
    }

    // 11. Insert student
    if (normalizedSql.startsWith('insert into students')) {
      const newStudent = inMemoryDb.addStudent({
        register_number: params[0],
        name: params[1],
        email: params[2],
        phone: params[3],
        department: params[4],
        year: params[5],
        section: params[6],
        profile_image_url: params[7]
      });
      return [{ insertId: newStudent.id, affectedRows: 1 }];
    }

    // 12. Update student
    if (normalizedSql.startsWith('update students')) {
      const id = params[params.length - 1];
      const updated = inMemoryDb.updateStudent(id, {
        ...(params[0] && { register_number: params[0] }),
        ...(params[1] && { name: params[1] }),
        ...(params[2] && { email: params[2] }),
        ...(params[3] && { phone: params[3] }),
        ...(params[4] && { department: params[4] }),
        ...(params[5] && { year: params[5] }),
        ...(params[6] && { section: params[6] }),
        ...(params[7] && { profile_image_url: params[7] })
      });
      return [{ affectedRows: updated ? 1 : 0 }];
    }

    // 13. Delete student
    if (normalizedSql.startsWith('delete from students')) {
      const id = params[0];
      const deleted = inMemoryDb.deleteStudent(id);
      return [{ affectedRows: deleted ? 1 : 0 }];
    }

    // 14. Attendance records for student ID
    if (normalizedSql.includes('from attendance where student_id = ?')) {
      const studentId = parseInt(params[0], 10);
      const rows = inMemoryDb.getAttendance().filter(a => a.student_id === studentId);
      return [rows];
    }

    // 15. All attendance records
    if (normalizedSql.includes('from attendance a') && normalizedSql.includes('join students s')) {
      const allStudents = inMemoryDb.getStudents();
      const allAtt = inMemoryDb.getAttendance();
      const rows = allAtt.map(a => {
        const s = allStudents.find(item => item.id === a.student_id) || {};
        return {
          ...a,
          student_name: s.name || '',
          register_number: s.register_number || '',
          department: s.department || '',
          year: s.year || 3,
          section: s.section || 'A'
        };
      });
      return [rows];
    }

    // 16. Record attendance (upsert)
    if (normalizedSql.startsWith('insert into attendance')) {
      inMemoryDb.recordAttendance({
        student_id: params[0],
        date: params[1],
        status: params[2],
        remarks: params[3]
      });
      return [{ affectedRows: 1 }];
    }

    // 17. Marks for student ID
    if (normalizedSql.includes('from marks where student_id = ?')) {
      const studentId = parseInt(params[0], 10);
      const rows = inMemoryDb.getMarks().filter(m => m.student_id === studentId);
      return [rows];
    }

    // 18. All marks
    if (normalizedSql.includes('from marks')) {
      return [inMemoryDb.getMarks()];
    }

    // 19. Insert / update mark
    if (normalizedSql.startsWith('insert into marks') || normalizedSql.startsWith('insert ignore into marks')) {
      inMemoryDb.recordMark({
        student_id: params[0],
        subject: params[1],
        marks: params[2],
        max_marks: params[3],
        semester: params[4]
      });
      return [{ affectedRows: 1 }];
    }

    // Generic fallback empty array
    return [[]];
  }
};

module.exports = {
  pool,
  dbConfig,
  checkDatabaseConnection
};
