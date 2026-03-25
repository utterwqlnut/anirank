import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const battle = new Hono();

battle.get("/", async (c) => {
  const tag = c.req.query("tag");

  let query = supabase
    .from("anime")
    .select("id, title, picture, thumbnail, score, elo_rating, tags, studios, media_type, episodes");

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  query = query
    .not("picture", "is", null)
    .not("title", "eq", "")
    .limit(500);

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  if (!data || data.length < 2) {
    return c.json({ error: "Not enough anime to battle" }, 400);
  }

  const i = Math.floor(Math.random() * data.length);
  let j = Math.floor(Math.random() * (data.length - 1));
  if (j >= i) j++;

  return c.json({ anime1: data[i], anime2: data[j] });
});

export default battle;
