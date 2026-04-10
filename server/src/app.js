const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors') 

// initialize the express app
const app = express()

// use the middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

// test route
app.get('/', (req, res) => {
  console.log('first')
  res.send('Hii from the prepstack')
})

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
app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  })
})

module.exports = app;
