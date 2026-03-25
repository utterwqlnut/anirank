import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../lib/api";

interface Props {
  selectedTag: string;
  onTagChange: (tag: string) => void;
}

export default function TagFilter({ selectedTag, onTagChange }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ tags: string[] }>("/anime/tags")
      .then((res) => setTags(res.tags))
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = search
    ? tags.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : tags;

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-sm text-base-content hover:text-primary border border-base-300 px-2 py-0.5"
        onClick={() => setOpen(!open)}
      >
        {selectedTag || "*"} <span className="text-base-content/50 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-base-100 border border-base-300 w-56 z-50 shadow-lg">
          <input
            type="text"
            placeholder="grep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-base-300 px-2 py-1 text-xs text-base-content outline-none placeholder:text-base-content/40"
            autoFocus
          />
          <div className="max-h-52 overflow-y-auto">
            <button
              className={`block w-full text-left px-2 py-0.5 text-xs hover:bg-base-300/50 ${
                !selectedTag ? "text-primary" : "text-base-content"
              }`}
              onClick={() => {
                onTagChange("");
                setOpen(false);
                setSearch("");
              }}
            >
              * (all)
            </button>
            {filtered.map((t) => (
              <button
                key={t}
                className={`block w-full text-left px-2 py-0.5 text-xs hover:bg-base-300/50 ${
                  selectedTag === t ? "text-primary" : "text-base-content"
                }`}
                onClick={() => {
                  onTagChange(t);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
