import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const battle = new Hono();

// Constants for elo calculation
const q = 0.00575646273; // ln(10)/400
const T = 900;
const rd0 = 150;

function g(rd: number) {
  return 1 / Math.sqrt(1 + (3 * q * q * rd * rd) / (Math.PI * Math.PI));
}

function expectedScore(elo1: number, elo2: number, rd2: number) {
  return 1 / (1 + Math.pow(10, g(rd2) * (elo2 - elo1) / 400));
}

function ratingUpdate(elo1: number, elo2: number, rd1: number, rd2: number) {
  let d = Math.sqrt(1 / (q * q * g(rd2) * g(rd2) * expectedScore(elo1, elo2, rd2) * (1 - expectedScore(elo1, elo2, rd2))));
  let exIJ = expectedScore(elo1, elo2, rd2);
  let exJI = 1 - exIJ;
  let newElo1 = elo1 + q / (1 / (rd1 * rd1) + 1 / (d * d)) * g(rd2) * (1 - exIJ);
  let newElo2 = elo2 + q / (1 / (rd2 * rd2) + 1 / (d * d)) * g(rd1) * (0 - exJI);
  return { elo1: newElo1, elo2: newElo2};
}
function eloCalc(winnerElo: number, loserElo: number, winnerMatches: number, loserMatches: number) {

  let winnerRD = rd0 * Math.pow(10, -winnerMatches / T);
  let loserRD = rd0 * Math.pow(10, -loserMatches / T);

  let { elo1, elo2 } = ratingUpdate(winnerElo, loserElo, winnerRD, loserRD);
  return { elo1, elo2 };

}
async function getRandomPair(tag?: string) {
  let query = supabase
    .from("anime")
    .select("id", { count: "exact", head: true })
    .not("picture", "is", null)
    .not("title", "eq", "")
    .order("elo_rating", { ascending: false });

  if (tag) query = query.contains("tags", [tag]);

  const { count } = await query;
  if (!count || count < 2) return null;

  const bias = 4;
  const i = Math.floor(Math.pow(Math.random(), bias) * count);
  const MAX_OFFSET = 50;

  const upper = Math.min(count - 1, i + MAX_OFFSET)
  const lower = Math.max(0, i - MAX_OFFSET)

  let j = Math.floor(Math.random() * (upper - lower)) + lower;

  if (j >= i) j++;

  const fields = "id, title, picture, thumbnail, score, elo_rating, tags, studios, media_type, episodes";

  let q1 = supabase
    .from("anime")
    .select(fields)
    .not("picture", "is", null)
    .not("title", "eq", "")
    .order("elo_rating", { ascending: false });
  let q2 = supabase
    .from("anime")
    .select(fields)
    .not("picture", "is", null)
    .not("title", "eq", "")
    .order("elo_rating", { ascending: false });

  if (tag) {
    q1 = q1.contains("tags", [tag]);
    q2 = q2.contains("tags", [tag]);
  }

  const [res1, res2] = await Promise.all([
    q1.range(i, i).single(),
    q2.range(j, j).single(),
  ]);

  if (res1.error || res2.error || !res1.data || !res2.data) return null;
  return { anime1: res1.data, anime2: res2.data };
}

battle.get("/count", async (c) => {
  const { data, error } = await supabase
    .from("anime")
    .select("num_matches.sum()");

  if (error || !data?.[0]) return c.json({ total: 0 });
  const sum = (data[0] as any).sum ?? 0;
  return c.json({ total: Math.floor(sum / 2) });
});

battle.get("/", async (c) => {
  const tag = c.req.query("tag");
  const pair = await getRandomPair(tag || undefined);

  if (!pair) {
    return c.json({ error: "Not enough anime to battle" }, 400);
  }

  return c.json(pair);
});

battle.post("/", async (c) => {
  const { winner_id, loser_id } = await c.req.json();

  if (!winner_id || !loser_id || winner_id === loser_id) {
    return c.json({ error: "Invalid winner_id / loser_id" }, 400);
  }

  const [{ data: winner }, { data: loser }] = await Promise.all([
    supabase.from("anime").select("elo_rating, num_matches").eq("id", winner_id).single(),
    supabase.from("anime").select("elo_rating, num_matches").eq("id", loser_id).single(),
  ]);

  if (!winner || !loser) {
    return c.json({ error: "Anime not found" }, 404);
  }

  const { elo1, elo2 } = eloCalc(winner.elo_rating, loser.elo_rating, winner.num_matches, loser.num_matches);

  await Promise.all([
    supabase.from("anime").update({ elo_rating: Math.round(elo1), num_matches: winner.num_matches + 1 }).eq("id", winner_id),
    supabase.from("anime").update({ elo_rating: Math.round(elo2), num_matches: loser.num_matches + 1 }).eq("id", loser_id),
  ]);

  return c.json({ ok: true });
});

export default battle;
