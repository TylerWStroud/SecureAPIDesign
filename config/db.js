import mongoose from "mongoose";

export default async function connectDB() {
  const url = process.env.MONGO_URL;
  if (!url) {
    console.error("MONGO_URL not set");
    process.exit(1);
  }
  try {
    await mongoose.connect(url);
    console.log(`MongoDB connected (${mongoose.connection.name})`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}
