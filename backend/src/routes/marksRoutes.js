const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');

// Marks & Results Endpoints
router.get('/', marksController.getAllMarks);
router.get('/summary', marksController.getMarksSummary);
router.post('/', marksController.addMarks);
router.put('/:id', marksController.updateMarks);
router.delete('/:id', marksController.deleteMarks);

module.exports = router;
