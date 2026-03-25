import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });

import { seedAnime } from "../lib/seed.js";

const maxPages = parseInt(process.argv[2] || "200", 10);

seedAnime(maxPages).catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
