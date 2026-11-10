const express = require('express');
const router = express.Router();
const { listNotes, upsertNote, deleteNote, importNotes } = require('../controllers/problemNotes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { problemNoteLimiter } = require('../middlewares/rateLimit.middleware');
const { upsertNoteSchema, importNotesSchema } = require('../validators/problemNotes.validators');

router.get('/', authMiddleware, listNotes);
router.put('/', authMiddleware, problemNoteLimiter, validate(upsertNoteSchema), upsertNote);
router.delete('/', authMiddleware, problemNoteLimiter, deleteNote);
router.post('/import', authMiddleware, problemNoteLimiter, validate(importNotesSchema), importNotes);

module.exports = router;
