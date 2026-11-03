const express = require('express');
const router = express.Router();
const termController = require('./term.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { roleGuard } = require('../../middleware/roleMiddleware');

router.get('/', authenticate, termController.getTerms);
router.post('/', authenticate, roleGuard('ADMIN'), termController.createTerm);
router.patch('/:id', authenticate, roleGuard('ADMIN'), termController.updateTerm);

module.exports = router;
