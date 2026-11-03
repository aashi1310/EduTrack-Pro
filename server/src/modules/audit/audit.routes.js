const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, roleGuard('ADMIN'), auditController.getAuditLogs);

module.exports = router;
