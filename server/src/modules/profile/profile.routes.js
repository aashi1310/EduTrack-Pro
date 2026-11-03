const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { authenticate } = require('../../middleware/authMiddleware');

router.get('/', authenticate, profileController.getProfile);
router.patch('/', authenticate, profileController.updateProfile);
router.patch('/password', authenticate, profileController.changePassword);

module.exports = router;
