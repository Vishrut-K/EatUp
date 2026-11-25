import { connectDB } from "../config/db.js";
import { seedDatabaseIfEmpty } from "../services/seedService.js";
import mongoose from "mongoose";

async function runSeed() {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();
    console.log("[EatUp Seed] Seeded restaurants and demo account successfully.");
  } catch (err) {
    console.error("[EatUp Seed] Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
