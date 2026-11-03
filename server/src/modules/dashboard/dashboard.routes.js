const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/admin', authenticate, roleGuard('ADMIN'), dashboardController.getAdminDashboard);
router.get('/faculty', authenticate, roleGuard('FACULTY', 'ADMIN'), dashboardController.getFacultyDashboard);
router.get('/student', authenticate, roleGuard('STUDENT', 'ADMIN'), dashboardController.getStudentDashboard);

module.exports = router;
