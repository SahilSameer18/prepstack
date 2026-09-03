require('dotenv').config()
const app = require('./src/app');
const connectToDB = require('./src/config/database')

const dns = require('dns');

// Override DNS in development or if explicitly requested (resolves local ISP SRV resolution issues)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CUSTOM_DNS === 'true') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

connectToDB()

app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`)
})