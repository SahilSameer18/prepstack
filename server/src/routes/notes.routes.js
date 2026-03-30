const express = require('express');
const { getNotes, getNotesBySubject } = require('../controllers/notes.controller');

const notesRouter = express.Router();

// route to get all the notes
notesRouter.get('/', getNotes);

// route to get notes by subject
notesRouter.get('/:subject', getNotesBySubject);

module.exports = notesRouter;