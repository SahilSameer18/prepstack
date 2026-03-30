const express = require('express');
const router = express.Router();
const sheetsController = require('../controllers/sheets.controller');

// route to get all the sheets
router.get('/', sheetsController.getSheets);

// route to get sheet by slug
router.get('/:slug', sheetsController.getSheetBySlug);

module.exports = router;