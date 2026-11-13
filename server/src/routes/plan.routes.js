const express = require('express');
const router = express.Router();
const { previewPlan, getPlan, createPlan, deletePlan, deleteHistory, previewChange, applyChange } = require('../controllers/plan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { planPreviewLimiter, planGenerateLimiter, planChangeLimiter } = require('../middlewares/rateLimit.middleware');
const { previewPlanSchema, createPlanSchema, previewChangeSchema, applyChangeSchema } = require('../validators/plan.validators');

// The one public route: the form's preview (numbers and week 1 only, no database write).
router.post('/preview', planPreviewLimiter, validate(previewPlanSchema), previewPlan);

// Everything else needs login.
router.get('/', authMiddleware, getPlan);
router.post('/', authMiddleware, planGenerateLimiter, validate(createPlanSchema), createPlan);
router.delete('/', authMiddleware, deletePlan);
router.delete('/history', authMiddleware, deleteHistory);
router.post('/changes/preview', authMiddleware, planChangeLimiter, validate(previewChangeSchema), previewChange);
router.post('/changes/apply', authMiddleware, planChangeLimiter, validate(applyChangeSchema), applyChange);

module.exports = router;
