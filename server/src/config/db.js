import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error(
      "MONGO_URI is missing. Copy server/.env.example to server/.env and add your MongoDB Atlas connection string."
    );
  }

  if (/<db_password>|<username>|<password>|<cluster>/i.test(env.mongoUri)) {
    throw new Error(
      "MONGO_URI in server/.env still contains placeholder text (e.g. <db_password>). Replace it with your actual MongoDB Atlas database user password (URL-encoded if it contains special characters like @, :, /, or #)."
    );
  }

  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(env.mongoUri);
  console.log(`[EatUp DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
