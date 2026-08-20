const express = require('express');
const router = express.Router();
const { getUserStats, getDashboardSummary } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// @desc get users stats 
router.get('/stats', getUserStats);

// @desc get dashboard summary 
router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;


