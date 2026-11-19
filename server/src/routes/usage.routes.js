const express = require('express');
const router = express.Router();
const { getUsage } = require('../controllers/usage.controller');
const authMiddleware = require('../modules/auth/auth.middleware');

router.get('/', authMiddleware, getUsage);

module.exports = router;
