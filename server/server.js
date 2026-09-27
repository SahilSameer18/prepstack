require('dotenv').config()

// Fail fast on missing JWT secrets instead of erroring later on first jwt.sign/verify call
if (!process.env.ACCESS_SECRET || !process.env.REFRESH_SECRET) {
  console.error('❌ Missing ACCESS_SECRET and/or REFRESH_SECRET in environment. Server cannot start.');
  process.exit(1);
}
if (process.env.ACCESS_SECRET.length < 32 || process.env.REFRESH_SECRET.length < 32) {
  console.warn('⚠️  ACCESS_SECRET/REFRESH_SECRET is shorter than the recommended 32 chars.');
}

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

