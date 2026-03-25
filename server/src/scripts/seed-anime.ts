import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });
import { supabase } from "../lib/supabase.js";
import { fetchTopAnime, type JikanAnime } from "../lib/anime-db.js";

function parseDuration(dur: string | null): number | null {
  if (!dur) return null;
  const hrMatch = dur.match(/(\d+)\s*hr/);
  const minMatch = dur.match(/(\d+)\s*min/);
  let secs = 0;
  if (hrMatch) secs += parseInt(hrMatch[1]) * 3600;
  if (minMatch) secs += parseInt(minMatch[1]) * 60;
  return secs || null;
}

function toRow(entry: JikanAnime) {
  return {
    mal_id: entry.mal_id,
    title: entry.title,
    title_english: entry.title_english || null,
    synonyms: entry.title_synonyms || [],
    media_type: entry.type || null,
    episodes: entry.episodes || null,
    airing_status: entry.status || null,
    season: entry.season || null,
    season_year: entry.year || null,
    picture: entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url || null,
    thumbnail: entry.images?.jpg?.small_image_url || entry.images?.jpg?.image_url || null,
    duration_secs: parseDuration(entry.duration),
    score: entry.score || null,
    synopsis: entry.synopsis || null,
    popularity: entry.popularity || null,
    members: entry.members || null,
    favorites: entry.favorites || null,
    tags: entry.genres?.map((g) => g.name) || [],
    studios: entry.studios?.map((s) => s.name) || [],
    producers: entry.producers?.map((p) => p.name) || [],
    sources: [`https://myanimelist.net/anime/${entry.mal_id}`],
  };
}

const DEFAULT_PAGES = 200; // 200 pages × 25 = up to 5000 anime

async function main() {
  const maxPages = parseInt(process.argv[2] || String(DEFAULT_PAGES), 10);
  console.log(`Seeding anime from Jikan API (up to ${maxPages} pages, ~${maxPages * 25} anime)...`);

  const entries = await fetchTopAnime(maxPages);
  console.log(`Upserting ${entries.length} anime into Supabase...`);

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize).map(toRow);

    const { error } = await supabase
      .from("anime")
      .upsert(batch, { onConflict: "mal_id", ignoreDuplicates: true });

    if (error) {
      console.error(`Error at batch ${i}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`  ${inserted}/${entries.length}`);
    }
  }

  console.log(`Done. ${inserted} anime in database.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
