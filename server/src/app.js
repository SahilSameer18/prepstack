const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const errorMiddleware = require('./middlewares/error.middleware')
const AppError = require('./utils/AppError')

// initialize the express app
const app = express()

// Trust reverse proxy (Vercel, Render, Nginx) for accurate client IP rate limiting
app.set('trust proxy', 1)

// use the middleware
app.use(express.json())
app.use(cookieParser())
// CORS configuration supporting localhost, production domain, Vercel previews, and custom env origins
const defaultOrigins = ["http://localhost:5173", "https://prepstack-ss.vercel.app"];
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : (process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : []);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...extraOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (e.g., Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/prepstack[a-z0-9-]*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}))

// test route
// app.get('/', (req, res) => {
//   console.log('first')
//   res.send('Hii from the prepstack')
// })

// require all the routes here
const authRouter = require('./routes/auth.routes')
const sheetsRouter = require('./routes/sheets.routes')
const projectRouter = require('./routes/project.routes')
const notesRouter = require('./routes/notes.routes')
const userRouter = require('./routes/user.routes')


// use all the routes here
app.use('/api/auth', authRouter)
app.use('/api/sheets', sheetsRouter)
app.use('/api/project', projectRouter)
app.use('/api/notes', notesRouter)
app.use('/api/user', userRouter)


// 404 — catch any unmatched routes and forward to error handler
app.use((req, res, next) => {
  next(new AppError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

// error handling middleware
app.use(errorMiddleware)

module.exports = app;

