import { supabase } from "./supabase.js";
import { fetchTopAnime, type JikanAnime } from "./anime-db.js";

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
  const maxRate = 2000;
  const minRate = 500;
  const defaultScore = 5;
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
    elo_rating: Math.round((entry.score ?? defaultScore) / 10 * (maxRate - minRate) + minRate),
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

export async function seedAnime(maxPages = 200) {
  console.log(`[seed] Starting — fetching up to ${maxPages} pages (~${maxPages * 25} anime)...`);

  const entries = await fetchTopAnime(maxPages);
  console.log(`[seed] Upserting ${entries.length} anime...`);

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize).map(toRow);

    const { error } = await supabase
      .from("anime")
      .upsert(batch, { onConflict: "mal_id", ignoreDuplicates: true });

    if (error) {
      console.error(`[seed] Error at batch ${i}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`[seed]   ${inserted}/${entries.length}`);
    }
  }

  console.log(`[seed] Done. ${inserted} anime upserted.`);
}
