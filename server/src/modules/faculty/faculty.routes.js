const express = require('express');
const router = express.Router();
const facultyController = require('./faculty.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, facultyController.getFacultyList);
router.post('/', authenticate, roleGuard('ADMIN'), facultyController.createFaculty);
router.get('/:id', authenticate, facultyController.getFacultyById);
router.patch('/:id', authenticate, roleGuard('ADMIN'), facultyController.updateFaculty);

module.exports = router;
