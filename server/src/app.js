const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const errorMiddleware = require('./middlewares/error.middleware')

// initialize the express app
const app = express()

// use the middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ["http://localhost:5173", "https://prepstack-ss.vercel.app"],
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


// use all the routes here
app.use('/api/auth', authRouter)
app.use('/api/sheets', sheetsRouter)
app.use('/api/project', projectRouter)
app.use('/api/notes', notesRouter)


// error handling middleware
app.use(errorMiddleware)

module.exports = app;

