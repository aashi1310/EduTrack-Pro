const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

// Offerings routes
router.get('/offerings', authenticate, courseController.getCourseOfferings);
router.post('/offerings', authenticate, roleGuard('ADMIN'), courseController.createCourseOffering);
router.patch('/offerings/:id', authenticate, roleGuard('ADMIN'), courseController.updateCourseOffering);

// Catalogue routes
router.get('/', authenticate, courseController.getCourses);
router.post('/', authenticate, roleGuard('ADMIN'), courseController.createCourse);
router.patch('/:id', authenticate, roleGuard('ADMIN'), courseController.updateCourse);

module.exports = router;
