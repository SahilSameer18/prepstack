const multer = require('multer');
const AppError = require('../utils/AppError');
const { MAX_PDF_BYTES } = require('../services/resume.service');

// The resume PDF is read into memory, parsed, and dropped: it is never written to disk. One file, one field.
// The browser-supplied type is only a first filter: resume.service checks the real bytes.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES, files: 1, fields: 8, fieldSize: 24 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new AppError(400, 'Only PDF files are accepted. You can also paste your resume text.'));
    return cb(null, true);
  },
});

// Runs the upload only for multipart requests. A plain JSON request (pasted resume text) goes straight on.
const resumeUpload = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();
  return upload.single('resume')(req, res, next);
};

module.exports = { resumeUpload };
