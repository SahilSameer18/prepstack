const express = require('express');
const cookieParser = require('cookie-parser')


const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  console.log('first')
  res.send('Hii from the cluster')
})

// require all the routes here
const authRouter = require('./routes/auth.routes')
const sheetsRouter = require('./routes/sheets.routes')


// use all the routes here
app.use('/api/auth', authRouter)
app.use('/api/sheets', sheetsRouter)

app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  })
})

module.exports = app;