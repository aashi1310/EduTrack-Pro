const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/export/csv', authenticate, roleGuard('ADMIN', 'FACULTY'), studentController.exportStudentsCsv);
router.get('/', authenticate, studentController.getStudents);
router.post('/', authenticate, roleGuard('ADMIN'), studentController.createStudent);
router.get('/:id', authenticate, studentController.getStudentById);
router.patch('/:id', authenticate, roleGuard('ADMIN'), studentController.updateStudent);
router.patch('/:id/status', authenticate, roleGuard('ADMIN'), studentController.updateStudentStatus);

module.exports = router;
