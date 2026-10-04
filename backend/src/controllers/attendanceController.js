const { pool } = require('../config/db');

/**
 * GET /api/attendance
 * Retrieve attendance logs with student details and filters
 */
async function getAllAttendance(req, res, next) {
  try {
    const { date, student_id, department, status } = req.query;

    let query = `
      SELECT 
        a.id,
        a.student_id,
        a.date,
        a.status,
        a.remarks,
        a.created_at,
        s.register_number,
        s.name AS student_name,
        s.department,
        s.year,
        s.section,
        s.profile_image_url
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ` AND a.date = ?`;
      params.push(date);
    }

    if (student_id) {
      query += ` AND a.student_id = ?`;
      params.push(student_id);
    }

    if (department && department !== 'All') {
      query += ` AND s.department = ?`;
      params.push(department);
    }

    if (status && status !== 'All') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.date DESC, s.register_number ASC`;

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/attendance/summary
 * Get aggregated attendance report for all students with percentage and <75% flag
 */
async function getAttendanceSummary(req, res, next) {
  try {
    const { department, year } = req.query;

    let query = `
      SELECT 
        s.id AS student_id,
        s.register_number,
        s.name AS student_name,
        s.department,
        s.year,
        s.section,
        s.profile_image_url,
        COUNT(a.id) AS total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
        ROUND(
          CASE 
            WHEN COUNT(a.id) > 0 THEN 
              (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100 
            ELSE 0 
          END, 2
        ) AS attendance_percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'All') {
      query += ` AND s.department = ?`;
      params.push(department);
    }

    if (year && year !== 'All') {
      query += ` AND s.year = ?`;
      params.push(parseInt(year, 10));
    }

    query += ` GROUP BY s.id ORDER BY s.register_number ASC`;

    const [rows] = await pool.query(query, params);

    const summary = rows.map(r => ({
      ...r,
      total_classes: Number(r.total_classes),
      present_count: Number(r.present_count),
      absent_count: Number(r.absent_count),
      attendance_percentage: Number(r.attendance_percentage),
      is_defaulter: Number(r.attendance_percentage) < 75.0 && Number(r.total_classes) > 0
    }));

    const totalStudents = summary.length;
    const defaultersCount = summary.filter(s => s.is_defaulter).length;
    const overallAvg = totalStudents > 0 
      ? Number((summary.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / totalStudents).toFixed(2))
      : 0;

    res.json({
      success: true,
      stats: {
        total_students: totalStudents,
        defaulters_count: defaultersCount,
        average_attendance: overallAvg
      },
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/attendance
 * Record single or bulk attendance with upsert (ON DUPLICATE KEY UPDATE)
 */
async function recordAttendance(req, res, next) {
  try {
    const { student_id, date, status, remarks, records } = req.body;

    // Handle bulk insertion if 'records' array is provided
    if (Array.isArray(records) && records.length > 0) {
      const formattedDate = date || new Date().toISOString().split('T')[0];

      for (const rec of records) {
        if (!rec.student_id || !rec.status) continue;
        await pool.query(
          `INSERT INTO attendance (student_id, date, status, remarks)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
          [rec.student_id, formattedDate, rec.status, rec.remarks || null]
        );
      }

      return res.status(201).json({
        success: true,
        message: `Attendance recorded for ${records.length} students on ${formattedDate}.`
      });
    }

    // Single student attendance record
    if (!student_id || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'student_id, date, and status (Present/Absent) are required.'
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Present' or 'Absent'."
      });
    }

    // Upsert attendance record
    await pool.query(
      `INSERT INTO attendance (student_id, date, status, remarks)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
      [student_id, date, status, remarks || null]
    );

    res.status(201).json({
      success: true,
      message: `Attendance recorded successfully.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/attendance/:id
 * Update an existing attendance record
 */
async function updateAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status ('Present' or 'Absent') is required."
      });
    }

    const [result] = await pool.query(
      `UPDATE attendance SET status = ?, remarks = COALESCE(?, remarks) WHERE id = ?`,
      [status, remarks, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Attendance record with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      message: 'Attendance record updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/attendance/:id
 * Delete an attendance record
 */
async function deleteAttendance(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM attendance WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Attendance record with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAttendance,
  getAttendanceSummary,
  recordAttendance,
  updateAttendance,
  deleteAttendance
};
