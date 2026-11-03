const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const studentRoutes = require('../modules/students/student.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');
const deptRoutes = require('../modules/departments/dept.routes');
const courseRoutes = require('../modules/courses/course.routes');
const termRoutes = require('../modules/terms/term.routes');
const enrollmentRoutes = require('../modules/enrollments/enrollment.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const examRoutes = require('../modules/examinations/exam.routes');
const resultRoutes = require('../modules/results/result.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');
const auditRoutes = require('../modules/audit/audit.routes');
const profileRoutes = require('../modules/profile/profile.routes');

// Dynamic Health Check Endpoint — real DB connection test
router.get('/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [[row]] = await conn.query('SELECT VERSION() AS mysql_version, NOW() AS server_time');
    conn.release();
    res.status(200).json({
      status: 'ONLINE',
      system: 'EduTrack Pro — Academic Management & Analytics Backend',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        mysql_version: row.mysql_version,
        server_time: row.server_time,
      },
    });
  } catch (err) {
    res.status(503).json({
      status: 'DEGRADED',
      system: 'EduTrack Pro — Academic Management & Analytics Backend',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: 'Database unreachable',
      },
    });
  }
});

// Mount Module Routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/departments', deptRoutes);
router.use('/courses', courseRoutes);
router.use('/terms', termRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/results', resultRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
