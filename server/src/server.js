import { createServer } from "http";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { seedDatabaseIfEmpty } from "./services/seedService.js";
import { initSocketServer } from "./socket/index.js";

async function startServer() {
  await connectDB();
  await seedDatabaseIfEmpty();

  const app = createApp();
  const httpServer = createServer(app);
  const io = initSocketServer(httpServer);

  app.set("io", io);

  httpServer.listen(env.port, () => {
    console.log(`[EatUp Server] Listening on http://localhost:${env.port}`);
  });
}

startServer().catch((err) => {
  console.error("[EatUp Server] Startup failed:", err.message);
  process.exit(1);
});
