const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply authentication middleware to all user routes
router.use(authMiddleware);

router.get('/stats', getUserStats);

module.exports = router;
