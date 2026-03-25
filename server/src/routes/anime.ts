import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const anime = new Hono();

anime.get("/", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 50), 100);
  const offset = Number(c.req.query("offset") || 0);
  const sort = c.req.query("sort") || "elo_rating";
  const order = c.req.query("order") === "asc" ? true : false;
  const tag = c.req.query("tag");

  let query = supabase
    .from("anime")
    .select("*", { count: "exact" })
    .not(sort, "is", null);

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error, count } = await query
    .order(sort, { ascending: order })
    .range(offset, offset + limit - 1);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, total: count, limit, offset });
});

anime.get("/tags", async (c) => {
  const { data, error } = await supabase.rpc("get_distinct_tags");

  if (error) {
    // Fallback: fetch a sample and extract tags client-side
    const { data: sample } = await supabase
      .from("anime")
      .select("tags")
      .not("tags", "eq", "{}")
      .limit(2000);

    const tagSet = new Set<string>();
    sample?.forEach((row: any) => row.tags?.forEach((t: string) => tagSet.add(t)));
    const tags = [...tagSet].sort();
    return c.json({ tags });
  }

  return c.json({ tags: data.map((r: any) => r.tag) });
});

anime.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

export default anime;
