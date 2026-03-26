import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import TagFilter from "../components/TagFilter";

interface Anime {
  id: number;
  title: string;
  title_english: string | null;
  picture: string | null;
  thumbnail: string | null;
  score: number | null;
  elo_rating: number;
  tags: string[];
  studios: string[];
  media_type: string | null;
  episodes: number | null;
  members: number | null;
}

interface AnimeResponse {
  data: Anime[];
  total: number | null;
  limit: number;
  offset: number;
}

function formatMembers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const PAGE_SIZE = 20;

export default function Leaderboard() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [tag, setTag] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: "elo_rating",
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (tag) params.set("tag", tag);

      const res = await apiFetch<AnimeResponse>(`/anime?${params}`);
      setAnime(res.data);
      setTotal(res.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, tag]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function handleTagChange(newTag: string) {
    setTag(newTag);
    setPage(0);
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-accent">~</span>
          <span className="text-base-content/70">filter:</span>
          <TagFilter selectedTag={tag} onTagChange={handleTagChange} />
        </div>
        <span className="text-base-content/60 text-xs">
          [{total.toLocaleString()} results]
        </span>
      </div>

      <div className={`${loading ? "opacity-40" : ""} transition-opacity`}>
        <div className="overflow-x-auto">
          <table className="table table-xs w-full">
            <thead>
              <tr className="border-b border-base-300 text-base-content/70">
                <th className="text-right w-10">#</th>
                <th>TITLE</th>
                <th className="text-right">ELO</th>
                <th className="text-right">MAL</th>
                <th className="text-right hidden sm:table-cell">USERS</th>
                <th className="hidden md:table-cell">TYPE</th>
              </tr>
            </thead>
            <tbody>
              {anime.length === 0 && loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-base-content/60">
                    loading...
                  </td>
                </tr>
              ) : (
                anime.map((a, i) => {
                  const rank = page * PAGE_SIZE + i + 1;
                  return (
                    <tr key={a.id} className="border-b border-base-300/50 hover:bg-base-300/30">
                      <td className="text-right text-base-content/60">
                        {rank}
                      </td>
                      <td className="max-w-xs">
                        <div className="flex items-center gap-2">
                          {a.thumbnail && (
                            <img
                              src={a.thumbnail}
                              alt=""
                              className="w-6 h-8 object-cover flex-shrink-0"
                            />
                          )}
                          <span className="truncate text-base-content">
                            {a.title_english || a.title}
                          </span>
                        </div>
                      </td>
                      <td className="text-right text-primary font-bold tabular-nums">
                        {a.elo_rating}
                      </td>
                      <td className="text-right text-secondary tabular-nums">
                        {a.score != null ? a.score.toFixed(1) : " — "}
                      </td>
                      <td className="text-right tabular-nums text-base-content/70 hidden sm:table-cell">
                        {a.members != null ? formatMembers(a.members) : " — "}
                      </td>
                      <td className="text-base-content/70 hidden md:table-cell">
                        {a.media_type || " — "}
                        {a.episodes ? ` (${a.episodes})` : ""}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-base-content/70">
        <button
          className="hover:text-base-content disabled:opacity-30"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          [← prev]
        </button>
        <span className="tabular-nums">
          page {page + 1}/{totalPages}
        </span>
        <button
          className="hover:text-base-content disabled:opacity-30"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages - 1}
        >
          [next →]
        </button>
      </div>
    </div>
  );
}
