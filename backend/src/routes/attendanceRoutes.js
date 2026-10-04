const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Attendance Endpoints
router.get('/', attendanceController.getAllAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);
router.post('/', attendanceController.recordAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
