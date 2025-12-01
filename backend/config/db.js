const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // options if needed
    });
    console.log("📡 Mongoose state:", mongoose.connection.readyState);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("connected", () => {
      console.log("🚀 Mongoose connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected");
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
