const express = require('express');
const router = express.Router();
const {
  getPlanOptions,
  previewPlan,
  previewPersonalPlan,
  getPlan,
  createPlan,
  deletePlan,
  deleteHistory,
  getHistory,
  getHistoryPlan,
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
  previewReportImport,
  applyReportImport,
  getSubstitutes,
  substituteItem,
} = require('./plan.controller');
const authMiddleware = require('../auth/auth.middleware');
const { previewRecovery, applyRecovery, getPausedPlan } = require('./planRecovery.controller');
const validate = require('../../shared/http/validate.middleware');
const {
  planPreviewLimiter,
  planGenerateLimiter,
  planChangeLimiter,
  planTickLimiter,
} = require('../../shared/http/rateLimit.middleware');
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
  reportImportSchema,
  applyReportImportSchema,
  substituteSchema,
  lifecyclePreviewSchema,
  lifecycleApplySchema,
} = require('./plan.validators');

// Public choices and anonymous previews never read account progress.
router.get('/options', getPlanOptions);
router.post('/preview', planPreviewLimiter, validate(previewPlanSchema), previewPlan);
router.post('/preview/personal', authMiddleware, planPreviewLimiter, validate(previewPlanSchema), previewPersonalPlan);

// Everything else needs login.
router.get('/', authMiddleware, getPlan);
router.post('/lifecycle/preview', authMiddleware, planChangeLimiter, validate(lifecyclePreviewSchema), previewRecovery);
router.post('/lifecycle/apply', authMiddleware, planChangeLimiter, validate(lifecycleApplySchema), applyRecovery);
router.get('/paused/:id', authMiddleware, getPausedPlan);
router.post('/', authMiddleware, planGenerateLimiter, validate(createPlanSchema), createPlan);
router.delete('/', authMiddleware, deletePlan);
router.delete('/history', authMiddleware, deleteHistory);
router.get('/history', authMiddleware, getHistory);
router.get('/history/:id', authMiddleware, getHistoryPlan);
router.post('/changes/preview', authMiddleware, planChangeLimiter, validate(previewChangeSchema), previewChange);
router.post('/changes/apply', authMiddleware, planChangeLimiter, validate(applyChangeSchema), applyChange);
router.post('/reports/:reportId/preview', authMiddleware, planChangeLimiter, validate(reportImportSchema), previewReportImport);
router.post('/reports/:reportId/apply', authMiddleware, planChangeLimiter, validate(applyReportImportSchema), applyReportImport);

// Optional learning checks and previewed practice use only the active owner's plan.
const learningController = require('./planLearning.controller');
router.get('/learning', authMiddleware, learningController.getLearning);
router.post('/learning/check', authMiddleware, planTickLimiter, validate(learningController.checkSchema), learningController.saveCheck);
router.post('/learning/preview', authMiddleware, planChangeLimiter, validate(learningController.choiceSchema), learningController.previewLearning);
router.post('/learning/apply', authMiddleware, planChangeLimiter, validate(learningController.applySchema), learningController.applyLearning);
router.post('/items/:id/practice', authMiddleware, planTickLimiter, validate(learningController.practiceSchema), learningController.finishPractice);

// Weekly review
router.get('/review', authMiddleware, validate(weeklyReviewQuerySchema, 'query'), getWeeklyReview);

// Items API
router.post('/items', authMiddleware, planChangeLimiter, validate(addItemSchema), addItem);
router.get('/items/:id/substitutes', authMiddleware, getSubstitutes);
router.post('/items/:id/substitute', authMiddleware, planChangeLimiter, validate(substituteSchema), substituteItem);
router.patch('/items/:id', authMiddleware, planTickLimiter, validate(updateItemSchema), updateItem);
router.delete('/items/:id', authMiddleware, planChangeLimiter, removeItem);
router.patch('/items/:id/star', authMiddleware, planTickLimiter, starItem);
router.post('/items/:id/result', authMiddleware, planTickLimiter, validate(recordResultSchema), recordResult);
router.post('/items/:id/review', authMiddleware, planTickLimiter, validate(recordReviewSchema), recordReview);
router.post('/items/:id/skip', authMiddleware, planTickLimiter, skipItem);
router.post('/items/:id/unskip', authMiddleware, planTickLimiter, unskipItem);

module.exports = router;
