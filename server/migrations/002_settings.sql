-- Site settings — everything the admin can change about the public UI
-- without a code deploy: brand, colours, section copy, section visibility.
--
-- Stored as one JSON document in one row rather than a column per setting.
-- Adding a new setting then costs nothing on the database side, and a save
-- is atomic: the admin never sees half a form applied.
--
-- To run:  npm run db:migrate
-- Safe to run more than once.

create table if not exists site_settings (
  id         integer     primary key default 1,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

-- Seed the single row. Empty object is fine — the frontend merges whatever
-- is here over its built-in defaults, so an empty document means
-- "everything as shipped".
insert into site_settings (id, data) values (1, '{}'::jsonb)
on conflict (id) do nothing;
