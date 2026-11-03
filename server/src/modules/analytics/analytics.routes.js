const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { authenticate } = require('../../middleware/authMiddleware');

router.get('/overview', authenticate, analyticsController.getAnalyticsOverview);
router.get('/departments', authenticate, analyticsController.getDepartmentAnalytics);
router.get('/attendance', authenticate, analyticsController.getAttendanceAnalytics);
router.get('/performance', authenticate, analyticsController.getPerformanceAnalytics);
router.get('/rankings', authenticate, analyticsController.getStudentRankings);

module.exports = router;
