const express = require('express');
const router = express.Router();
const { getUsage } = require('../controllers/usage.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getUsage);

module.exports = router;
