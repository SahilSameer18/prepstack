const express = require('express');
const router = express.Router();
const { getUserStats, getDashboardSummary, updateProfile, changePassword, deleteAccount } = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');
const validate = require('../../shared/http/validate.middleware');
const { accountActionLimiter } = require('../../shared/http/rateLimit.middleware');
const { updateProfileSchema, changePasswordSchema, deleteAccountSchema } = require('./user.validators');

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// @desc get users stats 
router.get('/stats', getUserStats);

// @desc get dashboard summary 
router.get('/dashboard-summary', getDashboardSummary);

// @desc update user profile (username, email, avatar)
router.put('/profile', validate(updateProfileSchema), updateProfile);

// @desc change user password
router.put('/change-password', accountActionLimiter, validate(changePasswordSchema), changePassword);

// @desc delete user account and wipe all personal progress (GDPR Right to Erasure)
router.delete('/account', accountActionLimiter, validate(deleteAccountSchema), deleteAccount);

module.exports = router;

