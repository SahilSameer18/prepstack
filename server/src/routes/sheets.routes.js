const express = require('express');
const router = express.Router();
const sheetsController = require('../controllers/sheets.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { toggleProblemSchema } = require('../validators/sheets.validators');

// route to get all the sheets
router.get('/', sheetsController.getSheets);

// route to get sheet by slug
router.get('/:slug', sheetsController.getSheetBySlug);

// route to get user progress
router.get('/:slug/progress', authMiddleware, sheetsController.getUserSheetProgress);

// route to toggle problem completion
router.post('/:slug/progress', authMiddleware, validate(toggleProblemSchema), sheetsController.toggleProblemCompletion);

module.exports = router;
