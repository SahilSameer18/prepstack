require('dotenv').config()
const app = require('./src/app');
const connectToDB = require('./src/config/database')

const dns = require('dns');

//changing dns because of mongodb not connected
dns.setServers(['1.1.1.1', '8.8.8.8'])

connectToDB()

app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`)
})