const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const errorMiddleware = require('./middlewares/error.middleware')
const AppError = require('./utils/AppError')

// initialize the express app
const app = express()

// Trust reverse proxy (Vercel, Render, Nginx) for accurate client IP rate limiting
app.set('trust proxy', 1)

// use the middleware
app.use(helmet()) // standard security headers, removes X-Powered-By

// One access-log line per request. Path only: never the query string or body, which can hold tokens.
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    if (req.path === '/health') return next(); // health checks run every few seconds, keep them out of the log
    const start = Date.now();
    // originalUrl, not req.path: routers rewrite req.path to be relative to their mount point
    const path = req.originalUrl.split('?')[0];
    res.on('finish', () => console.log(`${req.method} ${path} ${res.statusCode} ${Date.now() - start}ms`));
    next();
  });
}
app.use(express.json())
app.use(cookieParser())
// CORS: exact-match allowlist only. Add preview/extra origins via ALLOWED_ORIGINS (comma separated).
// Never use a pattern like prepstack*.vercel.app: anyone can register a matching Vercel project.
const defaultOrigins = ["http://localhost:5173", "https://prepstack-ss.vercel.app"];
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : (process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []);
const allowedOrigins = new Set(
  [...defaultOrigins, ...extraOrigins].map((o) => o.trim()).filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (e.g., Postman, server-to-server)
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);

    // Clean 403 (not a 500) and the handlers never run for a disallowed origin
    return callback(new AppError(403, 'Origin not allowed'));
  },
  credentials: true,
}))

// Health check for hosts and uptime monitors: 200 only when the database connection is up
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'unavailable', db: dbUp ? 'up' : 'down' });
});

// require all the routes here
const authRouter = require('./routes/auth.routes')
const sheetsRouter = require('./routes/sheets.routes')
const projectRouter = require('./routes/project.routes')
const notesRouter = require('./routes/notes.routes')
const userRouter = require('./routes/user.routes')
const analyzerRouter = require('./routes/analyzer.routes')
const usageRouter = require('./routes/usage.routes')


// use all the routes here
app.use('/api/auth', authRouter)
app.use('/api/sheets', sheetsRouter)
app.use('/api/project', projectRouter)
app.use('/api/notes', notesRouter)
app.use('/api/user', userRouter)
app.use('/api/analyzer', analyzerRouter)
app.use('/api/usage', usageRouter)


// 404: catch any unmatched routes and forward to error handler
app.use((req, res, next) => {
  next(new AppError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

// error handling middleware
app.use(errorMiddleware)

module.exports = app;

