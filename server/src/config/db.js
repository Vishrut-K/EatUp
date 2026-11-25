import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error(
      "MONGO_URI is missing. Copy server/.env.example to server/.env and add your MongoDB Atlas connection string."
    );
  }

  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(env.mongoUri);
  console.log(`[EatUp DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
