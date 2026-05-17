const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!uri) {
      throw new Error("MongoDB URI is not defined. Please set MONGO_URI in your environment variables.");
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
