import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const battle = new Hono();

async function getRandomPair(tag?: string) {
  let query = supabase
    .from("anime")
    .select("id", { count: "exact", head: true })
    .not("picture", "is", null)
    .not("title", "eq", "");

  if (tag) query = query.contains("tags", [tag]);

  const { count } = await query;
  if (!count || count < 2) return null;

  const i = Math.floor(Math.random() * count);
  let j = Math.floor(Math.random() * (count - 1));
  if (j >= i) j++;

  const fields = "id, title, picture, thumbnail, score, elo_rating, tags, studios, media_type, episodes";

  let q1 = supabase
    .from("anime")
    .select(fields)
    .not("picture", "is", null)
    .not("title", "eq", "");
  let q2 = supabase
    .from("anime")
    .select(fields)
    .not("picture", "is", null)
    .not("title", "eq", "");

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

battle.get("/", async (c) => {
  const tag = c.req.query("tag");
  const pair = await getRandomPair(tag || undefined);

  if (!pair) {
    return c.json({ error: "Not enough anime to battle" }, 400);
  }

  return c.json(pair);
});

export default battle;
