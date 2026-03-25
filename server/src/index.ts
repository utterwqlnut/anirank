import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import cron from "node-cron";
import api from "./routes/index.js";
import { seedAnime } from "./lib/seed.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.route("/api", api);

app.get("/", (c) => c.text("AniRank API"));

const port = Number(process.env.PORT) || 3000;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

cron.schedule("0 3 * * *", () => {
  console.log("[cron] Daily seed started");
  seedAnime(200).catch((err) => console.error("[cron] Seed failed:", err));
});
console.log("Daily seed scheduled at 3:00 AM");
