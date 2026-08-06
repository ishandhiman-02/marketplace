-- SubStore schema (plain Postgres)
-- Chalane ke liye:  npm run db:migrate
-- Dobara chalane pe safe hai.

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ── admin users ───────────────────────────────────────────────
-- Sirf admin login ke liye. Public signup kahin nahi hai —
-- account `npm run db:create-admin` se banta hai.
create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text        not null unique,
  password_hash text        not null,
  created_at    timestamptz not null default now()
);

-- ── products ──────────────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  subtitle    text,
  description text,
  category    text        not null,
  price       integer     not null check (price >= 0),
  duration    text,
  tag         text,
  tag_color   text,
  color       text,
  icon        text,
  image_url   text,
  variants    jsonb       not null default '[]'::jsonb,
  is_active   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ── daily offers ──────────────────────────────────────────────
create table if not exists daily_offers (
  id             uuid primary key default gen_random_uuid(),
  emoji          text,
  title          text        not null,
  subtitle       text,
  description    text,
  original_price integer     check (original_price >= 0),
  deal_price     integer     not null check (deal_price >= 0),
  tag            text,
  tag_color      text,
  slots_total    integer     not null default 0 check (slots_total >= 0),
  slots_left     integer     not null default 0 check (slots_left >= 0),
  expires_at     timestamptz,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  constraint slots_left_within_total check (slots_left <= slots_total)
);

-- ── proofs ────────────────────────────────────────────────────
create table if not exists proofs (
  id           uuid primary key default gen_random_uuid(),
  image_url    text        not null,
  caption      text,
  product_name text,
  is_active    boolean     not null default true,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

-- ── leads ─────────────────────────────────────────────────────
-- "Data of who is purchasing" — order Instagram DM pe hota hai,
-- isliye DM kholne se pehle site yahan lead save karti hai.
create table if not exists leads (
  id                 uuid primary key default gen_random_uuid(),
  name               text        not null,
  instagram_username text        not null,
  phone              text,
  product_name       text,
  price              integer     check (price >= 0),
  status             text        not null default 'new'
                     check (status in ('new', 'contacted', 'paid', 'delivered', 'cancelled')),
  notes              text,
  created_at         timestamptz not null default now()
);

create index if not exists products_sort_idx     on products (is_active, sort_order);
create index if not exists products_category_idx on products (category);
create index if not exists daily_offers_live_idx on daily_offers (is_active, expires_at);
create index if not exists proofs_sort_idx       on proofs (is_active, sort_order);
create index if not exists leads_created_idx     on leads (created_at desc);
create index if not exists leads_status_idx      on leads (status);
