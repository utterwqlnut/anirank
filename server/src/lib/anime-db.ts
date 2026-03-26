const JIKAN_BASE = "https://api.jikan.moe/v4";
const RATE_LIMIT_DELAY_MS = 400;

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_synonyms: string[];
  type: string | null;
  episodes: number | null;
  status: string | null;
  score: number | null;
  synopsis: string | null;
  season: string | null;
  year: number | null;
  duration: string | null;
  images: {
    jpg: {
      image_url: string | null;
      small_image_url: string | null;
      large_image_url: string | null;
    };
  };
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  genres: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
  producers: { mal_id: number; name: string }[];
}

interface JikanPaginatedResponse {
  data: JikanAnime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url);

    if (res.status === 429) {
      const wait = (attempt + 1) * 2000;
      console.log(`  Rate limited, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      if (attempt < retries - 1) {
        await sleep(1000);
        continue;
      }
      throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
    }

    return res;
  }
  throw new Error("Max retries exceeded");
}

export async function fetchTopAnimePage(page: number): Promise<JikanPaginatedResponse> {
  const url = `${JIKAN_BASE}/top/anime?page=${page}&limit=25&filter=bypopularity`;
  const res = await fetchWithRetry(url);
  return res.json();
}

export async function fetchTopAnime(maxPages: number): Promise<JikanAnime[]> {
  const all: JikanAnime[] = [];

  for (let page = 1; page <= maxPages; page++) {
    console.log(`Fetching page ${page}/${maxPages}...`);
    const { data, pagination } = await fetchTopAnimePage(page);
    all.push(...data);

    if (!pagination.has_next_page) break;
    await sleep(RATE_LIMIT_DELAY_MS);
  }

  console.log(`Fetched ${all.length} anime from Jikan`);
  return all;
}

export async function searchAnime(query: string, page = 1): Promise<JikanPaginatedResponse> {
  const url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=25`;
  const res = await fetchWithRetry(url);
  return res.json();
}

export async function fetchAnimeById(malId: number): Promise<JikanAnime> {
  const url = `${JIKAN_BASE}/anime/${malId}`;
  const res = await fetchWithRetry(url);
  const json = await res.json();
  return json.data;
}
