const express = require('express');
const router = express.Router();
const { createReport, listReports, getReport, deleteReport, setPlanItem, getToday } = require('../controllers/analyzer.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { analyzerLimiter, planTickLimiter } = require('../middlewares/rateLimit.middleware');
const { resumeUpload } = require('../middlewares/upload.middleware');
const { createReportSchema, planTickSchema } = require('../validators/analyzer.validators');

// Order matters: sign in first, then the hourly limit (failed requests are not counted), then read the upload, then check the form.
router.post('/', authMiddleware, analyzerLimiter, resumeUpload, validate(createReportSchema), createReport);
router.get('/', authMiddleware, listReports);
router.get('/today', authMiddleware, getToday); // before /:id, or "today" would be read as a report id
router.get('/:id', authMiddleware, getReport);
router.patch('/:id/plan', authMiddleware, planTickLimiter, validate(planTickSchema), setPlanItem);
router.delete('/:id', authMiddleware, deleteReport);

module.exports = router;
