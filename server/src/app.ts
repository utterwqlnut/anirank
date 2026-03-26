import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import api from "./routes/index.js";
import { seedAnime } from "./lib/seed.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
  })
);

app.route("/api", api);

app.get("/api/cron/seed", async (c) => {
  const authHeader = c.req.header("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  seedAnime(200).catch((err) => console.error("[cron] Seed failed:", err));
  return c.json({ ok: true, message: "Seed started" });
});

app.get("/", (c) => c.text("AniRank API"));

export default app;
