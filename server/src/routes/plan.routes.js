const express = require('express');
const router = express.Router();
const {
  previewPlan,
  getPlan,
  createPlan,
  deletePlan,
  deleteHistory,
  previewChange,
  applyChange,
  updateItem,
  addItem,
  removeItem,
  starItem,
  recordResult,
  recordReview,
  skipItem,
  unskipItem,
  getWeeklyReview,
} = require('../controllers/plan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  planPreviewLimiter,
  planGenerateLimiter,
  planChangeLimiter,
  planTickLimiter,
} = require('../middlewares/rateLimit.middleware');
const {
  previewPlanSchema,
  createPlanSchema,
  previewChangeSchema,
  applyChangeSchema,
  updateItemSchema,
  addItemSchema,
  recordResultSchema,
  recordReviewSchema,
  weeklyReviewQuerySchema,
} = require('../validators/plan.validators');

// The one public route: the form's preview (numbers and week 1 only, no database write).
router.post('/preview', planPreviewLimiter, validate(previewPlanSchema), previewPlan);

// Everything else needs login.
router.get('/', authMiddleware, getPlan);
router.post('/', authMiddleware, planGenerateLimiter, validate(createPlanSchema), createPlan);
router.delete('/', authMiddleware, deletePlan);
router.delete('/history', authMiddleware, deleteHistory);
router.post('/changes/preview', authMiddleware, planChangeLimiter, validate(previewChangeSchema), previewChange);
router.post('/changes/apply', authMiddleware, planChangeLimiter, validate(applyChangeSchema), applyChange);

// Weekly review
router.get('/review', authMiddleware, validate(weeklyReviewQuerySchema, 'query'), getWeeklyReview);

// Items API
router.post('/items', authMiddleware, planChangeLimiter, validate(addItemSchema), addItem);
router.patch('/items/:id', authMiddleware, planTickLimiter, validate(updateItemSchema), updateItem);
router.delete('/items/:id', authMiddleware, planChangeLimiter, removeItem);
router.patch('/items/:id/star', authMiddleware, planTickLimiter, starItem);
router.post('/items/:id/result', authMiddleware, planTickLimiter, validate(recordResultSchema), recordResult);
router.post('/items/:id/review', authMiddleware, planTickLimiter, validate(recordReviewSchema), recordReview);
router.post('/items/:id/skip', authMiddleware, planTickLimiter, skipItem);
router.post('/items/:id/unskip', authMiddleware, planTickLimiter, unskipItem);

module.exports = router;
