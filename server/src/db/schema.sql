-- Run this in your Supabase SQL Editor to create the anime table

create table if not exists anime (
  id            serial primary key,
  mal_id        integer unique,
  title         text not null,
  title_english text,
  synonyms      text[] default '{}',
  media_type    text,
  episodes      integer,
  airing_status text,
  season        text,
  season_year   integer,
  picture       text,
  thumbnail     text,
  duration_secs integer,
  score         real,
  synopsis      text,
  popularity    integer,
  members       integer,
  favorites     integer,
  tags          text[] default '{}',
  studios       text[] default '{}',
  producers     text[] default '{}',
  sources       text[] default '{}',

  -- Elo ranking fields
  elo_rating    real not null default 1500,
  num_matches   integer not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_anime_elo on anime (elo_rating desc);
create index if not exists idx_anime_score on anime (score desc nulls last);
create index if not exists idx_anime_title on anime using gin (to_tsvector('english', title));

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_anime_updated_at on anime;
create trigger trg_anime_updated_at
  before update on anime
  for each row
  execute function update_updated_at();

alter table anime enable row level security;

create policy "anime_public_read" on anime
  for select using (true);
