-- Portfolio batch: full-text search over notes and goals.
-- Applied manually via the Supabase SQL Editor, same as 0001.

-- Generated tsvector columns stay in sync automatically (no trigger needed,
-- unlike updated_at) — Postgres recomputes them on every insert/update from
-- the source columns.
alter table notes
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored;

create index if not exists notes_search_vector_idx on notes using gin (search_vector);

alter table goals
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(title, ''))
  ) stored;

create index if not exists goals_search_vector_idx on goals using gin (search_vector);
