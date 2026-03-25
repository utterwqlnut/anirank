import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "../lib/api";

interface BattleAnime {
  id: number;
  title: string;
  picture: string | null;
  thumbnail: string | null;
  score: number | null;
  elo_rating: number;
  tags: string[];
  studios: string[];
  media_type: string | null;
  episodes: number | null;
}

interface BattleResponse {
  anime1: BattleAnime;
  anime2: BattleAnime;
}

export default function Battle() {
  const [battle, setBattle] = useState<BattleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<"l" | "r" | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchBattle = useCallback(async () => {
    setLoading(true);
    setPicked(null);
    setInput("");
    try {
      const res = await apiFetch<BattleResponse>("/battle");
      setBattle(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBattle();
  }, [fetchBattle]);

  useEffect(() => {
    if (!loading && !picked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, battle, picked]);

  function handleSubmit() {
    if (!battle || picked) return;
    const cmd = input.trim().toLowerCase();
    setInput("");

    if (cmd === "l") {
      setPicked("l");
    } else if (cmd === "r") {
      setPicked("r");
    } else if (cmd === "") {
      fetchBattle();
    }
  }

  useEffect(() => {
    if (!picked) return;
    const timer = setTimeout(() => fetchBattle(), 400);
    return () => clearTimeout(timer);
  }, [picked, fetchBattle]);

  function renderAnimeCard(a: BattleAnime, side: "l" | "r") {
    const label = side === "l" ? "[L]" : "[R]";
    const isPicked = picked === side;
    const isNotPicked = picked !== null && picked !== side;

    return (
      <div
        className={`border transition-all duration-300
          ${isPicked ? "border-accent bg-accent/10 scale-[1.02]" : "border-base-300"}
          ${isNotPicked ? "opacity-30 scale-[0.98]" : ""}
        `}
      >
        {a.picture && (
          <img src={a.picture} alt={a.title} className="w-full h-56 object-cover" />
        )}
        <div className="p-3 space-y-1">
          <div className="text-base-content font-bold">
            <span className="text-primary">{label}</span> {a.title}
          </div>
          <div className="text-xs text-base-content/60">
            {[
              a.media_type,
              a.episodes ? `${a.episodes} eps` : null,
              a.score != null ? `MAL: ${a.score.toFixed(1)}` : null,
            ]
              .filter(Boolean)
              .join(" | ")}
          </div>
          {a.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {a.tags.slice(0, 5).map((t) => (
                <span key={t} className="text-xs border border-base-300 px-1 text-secondary">
                  {t}
                </span>
              ))}
            </div>
          )}
          {isPicked && (
            <div className="text-xs text-accent mt-1">✓ selected</div>
          )}
        </div>
      </div>
    );
  }

  if (loading && !battle) {
    return (
      <div className="text-center py-8 text-base-content/60 text-sm">
        loading matchup...
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="text-center py-8 text-error text-sm">
        error: failed to load battle
      </div>
    );
  }

  return (
    <div className="text-sm">
      <p className="text-base-content/70 mb-4">
        <span className="text-accent">?</span> Which anime do you prefer?
        <span className="text-base-content/50 ml-2">
          (type <span className="text-primary">l</span> or <span className="text-primary">r</span>, enter to skip)
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderAnimeCard(battle.anime1, "l")}
        {renderAnimeCard(battle.anime2, "r")}
      </div>

      <div className="mt-4 flex items-center gap-2 text-base-content/70">
        <span className="text-accent">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          disabled={!!picked || loading}
          placeholder="l / r / enter to skip"
          className="flex-1 bg-transparent outline-none text-base-content placeholder:text-base-content/30 disabled:opacity-40"
          autoFocus
        />
      </div>
    </div>
  );
}
