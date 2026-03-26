import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

import { serve } from "@hono/node-server";
import cron from "node-cron";
import app from "./app.js";
import { seedAnime } from "./lib/seed.js";

const port = Number(process.env.PORT) || 3000;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

cron.schedule("0 3 * * *", () => {
  console.log("[cron] Daily seed started");
  seedAnime(200).catch((err) => console.error("[cron] Seed failed:", err));
});
console.log("Daily seed scheduled at 3:00 AM");
