import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import Leaderboard from "./pages/Leaderboard";
import Battle from "./pages/Battle";

const THEMES = [
  "gruvbox",
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
];

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("anirank-theme") || "gruvbox";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("anirank-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 text-base-content">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <header className="border border-base-300 bg-base-100 mb-4">
            <div className="bg-base-300 px-3 py-1 text-xs text-base-content/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-error">●</span>
                <span className="text-secondary">●</span>
                <span className="text-accent">●</span>
                <span className="ml-2">anirank — zsh</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-base-200 border border-base-content/20 text-base-content text-xs px-1 py-0.5 rounded-none outline-none cursor-pointer"
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4">
              <pre className="text-primary text-sm mb-3">{`
   ___         _ ___          __  
  / _ | ___   (_) _ \\ ___ _ _/ /__
 / __ |/ _ \\ / / , _/ _ \`/ _ \\ / '_/
/_/ |_/_//_/_/_/_/|_|\\_,_/_//_/_/\\_\\
              `.trim()}</pre>
              <nav className="flex gap-2 mt-2">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `text-sm px-2 py-1 border ${
                      isActive
                        ? "border-primary text-primary bg-primary/10"
                        : "border-base-300 text-base-content/70 hover:text-base-content hover:border-base-content"
                    }`
                  }
                >
                  <span className="text-accent">$</span> leaderboard
                </NavLink>
                <NavLink
                  to="/battle"
                  className={({ isActive }) =>
                    `text-sm px-2 py-1 border ${
                      isActive
                        ? "border-primary text-primary bg-primary/10"
                        : "border-base-300 text-base-content/70 hover:text-base-content hover:border-base-content"
                    }`
                  }
                >
                  <span className="text-accent">$</span> battle
                </NavLink>
              </nav>
            </div>
          </header>
          <main className="border border-base-300 bg-base-100 p-4">
            <Routes>
              <Route path="/" element={<Leaderboard />} />
              <Route path="/battle" element={<Battle />} />
            </Routes>
          </main>
          <footer className="text-xs text-base-content/60 mt-2 px-1">
            <span className="text-accent">~</span> powered by Jikan API
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
