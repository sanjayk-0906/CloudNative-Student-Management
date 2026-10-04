const { pool } = require('../config/db');
const { uploadToS3, deleteFromS3 } = require('../services/s3Service');

/**
 * GET /api/students
 * Get all students with optional search and filters, plus calculated attendance % and avg marks
 */
async function getAllStudents(req, res, next) {
  try {
    const { search, department, year } = req.query;

    let query = `
      SELECT 
        s.*,
        COUNT(DISTINCT a.id) AS total_classes,
        COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.id END) AS present_count,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT a.id) > 0 THEN 
              (COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.id END) / COUNT(DISTINCT a.id)) * 100 
            ELSE 0 
          END, 2
        ) AS attendance_percentage,
        ROUND(AVG(m.marks), 2) AS average_marks
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      LEFT JOIN marks m ON s.id = m.student_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (s.name LIKE ? OR s.register_number LIKE ? OR s.email LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

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
 * GET /api/students/:id
 * Get single student with attendance history and subject marks breakdown
 */
async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    const [students] = await pool.query(
      `SELECT * FROM students WHERE id = ?`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${id} not found.`
      });
    }

    const student = students[0];

    // Fetch attendance records
    const [attendance] = await pool.query(
      `SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC`,
      [id]
    );

    // Calculate attendance summary
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'Present').length;
    const absentClasses = totalClasses - presentClasses;
    const attendancePercentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(2)) : 0;

    // Fetch marks records
    const [marks] = await pool.query(
      `SELECT * FROM marks WHERE student_id = ? ORDER BY subject ASC`,
      [id]
    );

    // Calculate marks summary
    const totalMarks = marks.reduce((sum, item) => sum + Number(item.marks), 0);
    const averageMarks = marks.length > 0 ? Number((totalMarks / marks.length).toFixed(2)) : 0;
    const hasFailed = marks.some(m => Number(m.marks) < 40);
    const resultStatus = marks.length === 0 ? 'Pending' : (hasFailed ? 'Fail' : 'Pass');

    res.json({
      success: true,
      data: {
        ...student,
        attendance_summary: {
          total_classes: totalClasses,
          present_classes: presentClasses,
          absent_classes: absentClasses,
          percentage: attendancePercentage,
          is_defaulter: attendancePercentage < 75 && totalClasses > 0
        },
        attendance_records: attendance,
        marks_summary: {
          total_marks: totalMarks,
          average_marks: averageMarks,
          subjects_count: marks.length,
          result_status: resultStatus
        },
        marks_records: marks
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/students
 * Add a new student
 */
async function createStudent(req, res, next) {
  try {
    const { register_number, name, email, phone, department, year, section, profile_image_url } = req.body;

    // Validation
    if (!register_number || !name || !email || !phone || !department || !year || !section) {
      return res.status(400).json({
        success: false,
        message: 'All fields (register_number, name, email, phone, department, year, section) are required.'
      });
    }

    // Check duplicate register number or email
    const [existing] = await pool.query(
      `SELECT id FROM students WHERE register_number = ? OR email = ?`,
      [register_number.trim(), email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Register Number or Email already exists.'
      });
    }

    let imageUrl = profile_image_url || null;

    // If a file was uploaded in this request
    if (req.file) {
      const uploadResult = await uploadToS3(req.file);
      imageUrl = uploadResult.url;
    }

    const [result] = await pool.query(
      `INSERT INTO students (register_number, name, email, phone, department, year, section, profile_image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        register_number.trim().toUpperCase(),
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        department.trim().toUpperCase(),
        parseInt(year, 10),
        section.trim().toUpperCase(),
        imageUrl
      ]
    );

    const newStudentId = result.insertId;

    // Default subject list to seed standard course modules for the student
    const defaultSubjects = [
      'Data Structures',
      'DBMS',
      'Cloud Computing',
      'Computer Networks',
      'Operating Systems'
    ];

    for (const sub of defaultSubjects) {
      await pool.query(
        `INSERT IGNORE INTO marks (student_id, subject, marks, max_marks, semester) VALUES (?, ?, ?, ?, ?)`,
        [newStudentId, sub, 0, 100, (parseInt(year, 10) * 2) - 1]
      );
    }

    const [createdStudent] = await pool.query(`SELECT * FROM students WHERE id = ?`, [newStudentId]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: createdStudent[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/students/:id
 * Update an existing student
 */
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { register_number, name, email, phone, department, year, section, profile_image_url } = req.body;

    const [existing] = await pool.query(`SELECT * FROM students WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${id} not found.`
      });
    }

    let imageUrl = profile_image_url !== undefined ? profile_image_url : existing[0].profile_image_url;

    if (req.file) {
      const uploadResult = await uploadToS3(req.file);
      imageUrl = uploadResult.url;
    }

    await pool.query(
      `UPDATE students 
       SET register_number = COALESCE(?, register_number),
           name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           department = COALESCE(?, department),
           year = COALESCE(?, year),
           section = COALESCE(?, section),
           profile_image_url = COALESCE(?, profile_image_url)
       WHERE id = ?`,
      [
        register_number ? register_number.trim().toUpperCase() : null,
        name ? name.trim() : null,
        email ? email.trim().toLowerCase() : null,
        phone ? phone.trim() : null,
        department ? department.trim().toUpperCase() : null,
        year ? parseInt(year, 10) : null,
        section ? section.trim().toUpperCase() : null,
        imageUrl,
        id
      ]
    );

    const [updated] = await pool.query(`SELECT * FROM students WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'Student updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/students/:id
 * Delete student
 */
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM students WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${id} not found.`
      });
    }

    // Attempt to delete photo from S3 if configured
    if (existing[0].profile_image_url) {
      await deleteFromS3(existing[0].profile_image_url);
    }

    await pool.query(`DELETE FROM students WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: `Student '${existing[0].name}' (${existing[0].register_number}) deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/students/:id/upload
 * Dedicated file upload to Amazon S3 (Profile Image / Document)
 */
async function uploadStudentFile(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM students WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${id} not found.`
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a file to upload.'
      });
    }

    const uploadResult = await uploadToS3(req.file);

    // Update student's profile_image_url in database
    await pool.query(
      `UPDATE students SET profile_image_url = ? WHERE id = ?`,
      [uploadResult.url, id]
    );

    res.json({
      success: true,
      message: uploadResult.message,
      storage: uploadResult.storage,
      url: uploadResult.url
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentFile
};
