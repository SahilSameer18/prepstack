const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    // process.exit(1); // stop server if DB fails
  }
};

module.exports = connectToDB;