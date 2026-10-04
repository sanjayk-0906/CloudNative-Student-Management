const { pool } = require('../config/db');

/**
 * GET /api/dashboard
 * Aggregated analytics and stats for the main dashboard view
 */
async function getDashboardStats(req, res, next) {
  try {
    // 1. Total Students
    const [[{ total_students }]] = await pool.query(`SELECT COUNT(*) AS total_students FROM students`);

    // 2. Department Count and Distribution
    const [deptDistribution] = await pool.query(`
      SELECT department, COUNT(*) AS count
      FROM students
      GROUP BY department
      ORDER BY count DESC
    `);
    const totalDepartments = deptDistribution.length;

    // 3. Attendance Statistics (Total Average & Students Below 75%)
    const [attendanceStats] = await pool.query(`
      SELECT 
        s.id,
        COUNT(a.id) AS total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        ROUND(
          CASE 
            WHEN COUNT(a.id) > 0 THEN 
              (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100 
            ELSE 0 
          END, 2
        ) AS attendance_percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      GROUP BY s.id
    `);

    let totalAttendanceSum = 0;
    let defaultersCount = 0;
    let studentsWithAttendance = 0;

    attendanceStats.forEach(item => {
      const pct = Number(item.attendance_percentage);
      const total = Number(item.total_classes);
      if (total > 0) {
        totalAttendanceSum += pct;
        studentsWithAttendance++;
        if (pct < 75.0) {
          defaultersCount++;
        }
      }
    });

    const averageAttendance = studentsWithAttendance > 0 
      ? Number((totalAttendanceSum / studentsWithAttendance).toFixed(2)) 
      : 0;

    // Attendance distribution for charts (e.g. >=85%, 75-84%, <75%)
    const attendanceBrackets = {
      excellent: attendanceStats.filter(s => Number(s.attendance_percentage) >= 85 && Number(s.total_classes) > 0).length,
      good: attendanceStats.filter(s => Number(s.attendance_percentage) >= 75 && Number(s.attendance_percentage) < 85 && Number(s.total_classes) > 0).length,
      defaulter: defaultersCount
    };

    // 4. Academic Marks Statistics (Average Marks & Subject Averages)
    const [[{ avg_marks }]] = await pool.query(`
      SELECT ROUND(AVG(marks), 2) AS avg_marks FROM marks
    `);

    const [subjectAverages] = await pool.query(`
      SELECT 
        subject,
        ROUND(AVG(marks), 2) AS average_marks,
        ROUND(MIN(marks), 2) AS min_marks,
        ROUND(MAX(marks), 2) AS max_marks,
        COUNT(id) AS evaluations_count
      FROM marks
      GROUP BY subject
      ORDER BY subject ASC
    `);

    // 5. Recent Activity Logs (Latest Attendance entries)
    const [recentAttendance] = await pool.query(`
      SELECT 
        a.id,
        a.date,
        a.status,
        s.name AS student_name,
        s.register_number,
        s.department
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT 5
    `);

    // 6. Top Performing Students
    const [topStudents] = await pool.query(`
      SELECT 
        s.id,
        s.register_number,
        s.name,
        s.department,
        s.profile_image_url,
        ROUND(AVG(m.marks), 2) AS average_marks
      FROM students s
      JOIN marks m ON s.id = m.student_id
      GROUP BY s.id
      ORDER BY average_marks DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        summary: {
          total_students: Number(total_students),
          average_attendance: averageAttendance,
          defaulters_count: defaultersCount,
          average_marks: avg_marks !== null ? Number(avg_marks) : 0,
          total_departments: totalDepartments
        },
        charts: {
          departments: deptDistribution,
          attendance_brackets: attendanceBrackets,
          subject_averages: subjectAverages
        },
        recent_activity: recentAttendance,
        top_students: topStudents
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
