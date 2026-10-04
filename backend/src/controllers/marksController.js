const { pool } = require('../config/db');

const ALLOWED_SUBJECTS = [
  'Data Structures',
  'DBMS',
  'Cloud Computing',
  'Computer Networks',
  'Operating Systems'
];

/**
 * GET /api/marks
 * Get all marks or student performance summary with totals, averages, and Pass/Fail status
 */
async function getAllMarks(req, res, next) {
  try {
    const { student_id, department, subject } = req.query;

    let query = `
      SELECT 
        m.id,
        m.student_id,
        m.subject,
        m.marks,
        m.max_marks,
        m.semester,
        m.exam_type,
        m.created_at,
        s.register_number,
        s.name AS student_name,
        s.department,
        s.year,
        s.section
      FROM marks m
      JOIN students s ON m.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND m.student_id = ?`;
      params.push(student_id);
    }

    if (department && department !== 'All') {
      query += ` AND s.department = ?`;
      params.push(department);
    }

    if (subject && subject !== 'All') {
      query += ` AND m.subject = ?`;
      params.push(subject);
    }

    query += ` ORDER BY s.register_number ASC, m.subject ASC`;

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      allowed_subjects: ALLOWED_SUBJECTS,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/marks/summary
 * Get aggregated student result sheet with Total, Average, and Pass/Fail status
 */
async function getMarksSummary(req, res, next) {
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
        COUNT(m.id) AS subjects_evaluated,
        COALESCE(SUM(m.marks), 0) AS total_marks,
        COALESCE(SUM(m.max_marks), 0) AS max_total_marks,
        ROUND(COALESCE(AVG(m.marks), 0), 2) AS average_marks,
        MIN(m.marks) AS minimum_subject_marks
      FROM students s
      LEFT JOIN marks m ON s.id = m.student_id
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

    query += ` GROUP BY s.id ORDER BY average_marks DESC, s.register_number ASC`;

    const [rows] = await pool.query(query, params);

    // Fetch individual subject marks for all students to return complete scorecards
    const [allSubjectMarks] = await pool.query(`
      SELECT student_id, subject, marks, max_marks FROM marks
    `);

    const marksMap = {};
    allSubjectMarks.forEach(m => {
      if (!marksMap[m.student_id]) marksMap[m.student_id] = {};
      marksMap[m.student_id][m.subject] = Number(m.marks);
    });

    const report = rows.map(r => {
      const studentSubjects = marksMap[r.student_id] || {};
      const subjectKeys = Object.keys(studentSubjects);
      const isComplete = subjectKeys.length >= 5;
      const minMark = r.minimum_subject_marks !== null ? Number(r.minimum_subject_marks) : 0;
      const passed = isComplete && minMark >= 40;

      let resultStatus = 'Pending';
      if (subjectKeys.length > 0) {
        resultStatus = passed ? 'Pass' : 'Fail';
      }

      return {
        ...r,
        total_marks: Number(r.total_marks),
        max_total_marks: Number(r.max_total_marks),
        average_marks: Number(r.average_marks),
        result_status: resultStatus,
        subjects: studentSubjects
      };
    });

    const totalStudents = report.length;
    const passedCount = report.filter(s => s.result_status === 'Pass').length;
    const failedCount = report.filter(s => s.result_status === 'Fail').length;
    const passPercentage = totalStudents > 0 ? Number(((passedCount / totalStudents) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      stats: {
        total_students: totalStudents,
        passed_count: passedCount,
        failed_count: failedCount,
        pass_percentage: passPercentage
      },
      allowed_subjects: ALLOWED_SUBJECTS,
      data: report
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/marks
 * Add or update marks for a student
 */
async function addMarks(req, res, next) {
  try {
    const { student_id, subject, marks, max_marks, semester, exam_type } = req.body;

    if (!student_id || !subject || marks === undefined || marks === null) {
      return res.status(400).json({
        success: false,
        message: 'student_id, subject, and marks are required.'
      });
    }

    const numMarks = parseFloat(marks);
    const numMax = parseFloat(max_marks || 100);

    if (isNaN(numMarks) || numMarks < 0 || numMarks > numMax) {
      return res.status(400).json({
        success: false,
        message: `Marks must be a valid number between 0 and ${numMax}.`
      });
    }

    const examTypeStr = exam_type || 'Semester Final';

    // Upsert mark record
    await pool.query(
      `INSERT INTO marks (student_id, subject, marks, max_marks, semester, exam_type)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE marks = VALUES(marks), max_marks = VALUES(max_marks), semester = VALUES(semester)`,
      [student_id, subject, numMarks, numMax, semester || 5, examTypeStr]
    );

    res.status(201).json({
      success: true,
      message: `Marks for subject '${subject}' saved successfully.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/marks/:id
 * Update marks record by ID
 */
async function updateMarks(req, res, next) {
  try {
    const { id } = req.params;
    const { marks, max_marks, subject } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({
        success: false,
        message: 'Marks value is required.'
      });
    }

    const numMarks = parseFloat(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid marks number required.'
      });
    }

    const [result] = await pool.query(
      `UPDATE marks 
       SET marks = ?, 
           max_marks = COALESCE(?, max_marks),
           subject = COALESCE(?, subject)
       WHERE id = ?`,
      [numMarks, max_marks || null, subject || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Marks record with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      message: 'Marks updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/marks/:id
 * Delete marks record by ID
 */
async function deleteMarks(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM marks WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Marks record with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      message: 'Marks record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllMarks,
  getMarksSummary,
  addMarks,
  updateMarks,
  deleteMarks,
  ALLOWED_SUBJECTS
};
