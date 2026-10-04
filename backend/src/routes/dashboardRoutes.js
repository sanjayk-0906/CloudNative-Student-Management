const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard analytics endpoint
router.get('/', dashboardController.getDashboardStats);

module.exports = router;
