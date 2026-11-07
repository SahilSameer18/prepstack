const express = require('express');
const router = express.Router();
const { createReport, listReports, getReport, deleteReport } = require('../controllers/analyzer.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { analyzerLimiter } = require('../middlewares/rateLimit.middleware');
const { resumeUpload } = require('../middlewares/upload.middleware');
const { createReportSchema } = require('../validators/analyzer.validators');

// Order matters: sign in first, then the hourly limit (failed requests are not counted), then read the upload, then check the form.
router.post('/', authMiddleware, analyzerLimiter, resumeUpload, validate(createReportSchema), createReport);
router.get('/', authMiddleware, listReports);
router.get('/:id', authMiddleware, getReport);
router.delete('/:id', authMiddleware, deleteReport);

module.exports = router;
