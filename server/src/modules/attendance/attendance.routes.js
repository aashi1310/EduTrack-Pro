const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/sessions', authenticate, attendanceController.getOfferingSessions);
router.post('/sessions', authenticate, roleGuard('FACULTY', 'ADMIN'), attendanceController.createSession);
router.get('/sessions/:id/records', authenticate, attendanceController.getSessionAttendance);
router.post('/sessions/:id/records', authenticate, roleGuard('FACULTY', 'ADMIN'), attendanceController.recordSessionAttendance);
router.get('/summary', authenticate, attendanceController.getAttendanceSummary);

module.exports = router;
