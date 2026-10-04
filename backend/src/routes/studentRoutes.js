const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const upload = require('../middleware/upload');

// Student REST Endpoints
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', upload.single('profile_image'), studentController.createStudent);
router.put('/:id', upload.single('profile_image'), studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// S3 File Upload Endpoint
router.post('/:id/upload', upload.single('file'), studentController.uploadStudentFile);

module.exports = router;
