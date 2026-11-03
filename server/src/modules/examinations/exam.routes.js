const express = require('express');
const router = express.Router();
const examController = require('./exam.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, examController.getExams);
router.post('/', authenticate, roleGuard('FACULTY', 'ADMIN'), examController.createExam);
router.patch('/:id', authenticate, roleGuard('FACULTY', 'ADMIN'), examController.updateExam);
router.post('/:id/publish', authenticate, roleGuard('FACULTY', 'ADMIN'), examController.publishExam);
router.delete('/:id', authenticate, roleGuard('FACULTY', 'ADMIN'), examController.deleteExam);

module.exports = router;
