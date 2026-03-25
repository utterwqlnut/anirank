# AniRank
<img width="1248" height="857" alt="Screenshot 2026-03-25 at 2 45 31 AM" src="https://github.com/user-attachments/assets/3d7689bc-457a-4050-a48e-870ba60f3449" />

A CLI-themed anime ranking app where you vote head-to-head between anime to build an Elo leaderboard. Data sourced from the [Jikan API](https://jikan.moe/) (unofficial MyAnimeList API).

## Stack

- **Frontend** — React, Vite, Tailwind CSS v4, DaisyUI v5 (36 themes including custom gruvbox)
- **Backend** — Hono, TypeScript
- **Database** — Supabase
- **Data source** — Jikan API v4

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
PORT=3000
```

### 3. Create the database table

Run the contents of `server/src/db/schema.sql` in your Supabase SQL Editor.

### 4. Seed anime data

```bash
npm run seed --workspace=server
```

This fetches the top ~5000 anime from Jikan and upserts them into Supabase. Takes a few minutes due to rate limits. For a quicker test:

```bash
npx tsx server/src/scripts/seed-anime.ts 10
```

### 5. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
anirank/
├── server/
│   └── src/
│       ├── index.ts            # Hono server entry
│       ├── lib/
│       │   ├── anime-db.ts     # Jikan API client
│       │   └── supabase.ts     # Supabase client
│       ├── routes/
│       │   ├── anime.ts        # GET /api/anime, /api/anime/tags, /api/anime/:id
│       │   ├── battle.ts       # GET /api/battle (random pair)
│       │   └── health.ts
│       ├── scripts/
│       │   └── seed-anime.ts   # Seed script
│       └── db/
│           └── schema.sql      # Postgres schema
├── web/
│   └── src/
│       ├── App.tsx             # Layout, theme selector, nav
│       ├── pages/
│       │   ├── Leaderboard.tsx # Elo-ranked table with tag filtering
│       │   └── Battle.tsx      # Head-to-head voting (type l/r/enter)
│       ├── components/
│       │   └── TagFilter.tsx   # Genre filter dropdown
│       └── lib/
│           └── api.ts          # API fetch helper
├── .env.example
└── package.json
```

## Usage

**Leaderboard** — Browse anime ranked by Elo rating. Filter by genre, paginate through results.

**Battle** — Two anime are shown side by side. Type `l` to pick left, `r` to pick right, or press `Enter` to skip. Your votes update the Elo ratings.

**Theme selector** — Switch between 36 DaisyUI themes from the dropdown in the title bar.
