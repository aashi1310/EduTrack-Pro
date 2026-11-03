const express = require('express');
const router = express.Router();
const resultController = require('./result.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, resultController.getResults);
router.post('/', authenticate, roleGuard('FACULTY', 'ADMIN'), resultController.saveMarks);
router.get('/exam/:id', authenticate, roleGuard('FACULTY', 'ADMIN'), resultController.getExamMarksheet);
router.get('/student/:id', authenticate, resultController.getStudentResults);
router.patch('/:id', authenticate, roleGuard('FACULTY', 'ADMIN'), resultController.updateSingleResult);

module.exports = router;
