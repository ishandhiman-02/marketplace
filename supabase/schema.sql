-- SubStore schema
-- Supabase dashboard > SQL Editor mein ye poora file paste karke run karein.
-- Dobara chalane pe bhi safe hai (idempotent).

-- ─────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────

create table if not exists public.products (
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

create table if not exists public.daily_offers (
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

create table if not exists public.proofs (
  id           uuid primary key default gen_random_uuid(),
  image_url    text        not null,
  caption      text,
  product_name text,
  is_active    boolean     not null default true,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.leads (
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

-- admin panel ki common queries ke liye
create index if not exists products_sort_idx      on public.products (is_active, sort_order);
create index if not exists products_category_idx  on public.products (category);
create index if not exists daily_offers_live_idx  on public.daily_offers (is_active, expires_at);
create index if not exists proofs_sort_idx        on public.proofs (is_active, sort_order);
create index if not exists leads_created_idx      on public.leads (created_at desc);
create index if not exists leads_status_idx       on public.leads (status);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- RLS on karne ka matlab: bina policy ke koi bhi kuch nahi kar sakta.
-- anon key browser mein public hai — asli suraksha yahi policies hain.
-- ─────────────────────────────────────────────────────────────

alter table public.products     enable row level security;
alter table public.daily_offers enable row level security;
alter table public.proofs       enable row level security;
alter table public.leads        enable row level security;

-- products ------------------------------------------------------
drop policy if exists "products public read active" on public.products;
create policy "products public read active"
  on public.products for select to anon
  using (is_active);

-- admin ko inactive rows bhi dikhni chahiye warna wo unhe manage nahi kar payega
drop policy if exists "products admin read all" on public.products;
create policy "products admin read all"
  on public.products for select to authenticated
  using (true);

drop policy if exists "products admin write" on public.products;
create policy "products admin write"
  on public.products for all to authenticated
  using (true) with check (true);

-- daily_offers --------------------------------------------------
drop policy if exists "offers public read active" on public.daily_offers;
create policy "offers public read active"
  on public.daily_offers for select to anon
  using (is_active);

drop policy if exists "offers admin read all" on public.daily_offers;
create policy "offers admin read all"
  on public.daily_offers for select to authenticated
  using (true);

drop policy if exists "offers admin write" on public.daily_offers;
create policy "offers admin write"
  on public.daily_offers for all to authenticated
  using (true) with check (true);

-- proofs --------------------------------------------------------
drop policy if exists "proofs public read active" on public.proofs;
create policy "proofs public read active"
  on public.proofs for select to anon
  using (is_active);

drop policy if exists "proofs admin read all" on public.proofs;
create policy "proofs admin read all"
  on public.proofs for select to authenticated
  using (true);

drop policy if exists "proofs admin write" on public.proofs;
create policy "proofs admin write"
  on public.proofs for all to authenticated
  using (true) with check (true);

-- leads ---------------------------------------------------------
-- public sirf apni lead daal sakta hai; padhna/badalna sirf admin ka kaam.
-- (koi SELECT policy anon ke liye nahi hai — isliye public kabhi leads nahi padh sakta)
drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert"
  on public.leads for insert to anon
  with check (true);

drop policy if exists "leads admin read" on public.leads;
create policy "leads admin read"
  on public.leads for select to authenticated
  using (true);

drop policy if exists "leads admin update" on public.leads;
create policy "leads admin update"
  on public.leads for update to authenticated
  using (true) with check (true);

drop policy if exists "leads admin delete" on public.leads;
create policy "leads admin delete"
  on public.leads for delete to authenticated
  using (true);

-- ─────────────────────────────────────────────────────────────
-- STORAGE — proof screenshots
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "proofs bucket public read" on storage.objects;
create policy "proofs bucket public read"
  on storage.objects for select to public
  using (bucket_id = 'proofs');

drop policy if exists "proofs bucket admin upload" on storage.objects;
create policy "proofs bucket admin upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs');

drop policy if exists "proofs bucket admin update" on storage.objects;
create policy "proofs bucket admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'proofs');

drop policy if exists "proofs bucket admin delete" on storage.objects;
create policy "proofs bucket admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'proofs');
