const express = require('express');
const router = express.Router();
const sheetsController = require('../controllers/sheets.controller');

router.get('/', sheetsController.getSheets);
router.get('/:slug', sheetsController.getSheetBySlug);

module.exports = router;