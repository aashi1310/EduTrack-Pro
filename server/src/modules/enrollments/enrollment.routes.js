const express = require('express');
const router = express.Router();
const enrollmentController = require('./enrollment.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, enrollmentController.getEnrollments);
router.post('/', authenticate, enrollmentController.enrollStudent);
router.patch('/:id/status', authenticate, roleGuard('ADMIN'), enrollmentController.updateEnrollmentStatus);

module.exports = router;
