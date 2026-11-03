const express = require('express');
const router = express.Router();
const deptController = require('./dept.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, deptController.getDepartments);
router.post('/', authenticate, roleGuard('ADMIN'), deptController.createDepartment);
router.patch('/:id', authenticate, roleGuard('ADMIN'), deptController.updateDepartment);
router.delete('/:id', authenticate, roleGuard('ADMIN'), deptController.deleteDepartment);

module.exports = router;
