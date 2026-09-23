-- =============================================================================
-- Fields needed by the public design, plus quick stats and contact messages.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- New columns on existing tables
-- -----------------------------------------------------------------------------

alter table public.profile
  add column summary          text    not null default '',
  add column is_open_to_work  boolean not null default true,
  add column interests        text[]  not null default '{}';

alter table public.experiences
  add column technologies text[] not null default '{}';

alter table public.certifications
  add column icon text check (icon is null or char_length(icon) <= 8);

alter table public.achievements
  add column icon text check (icon is null or char_length(icon) <= 8);

-- -----------------------------------------------------------------------------
-- Quick stats shown under the hero (e.g. "93 Days" / "LeetCode Streak")
-- -----------------------------------------------------------------------------

create table public.stats (
  id            uuid primary key default gen_random_uuid(),
  value         text not null check (char_length(value) between 1 and 20),
  unit          text check (unit is null or char_length(unit) <= 20),
  label         text not null check (char_length(label) between 1 and 60),
  display_order integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index stats_order_idx on public.stats (display_order);

create trigger set_updated_at before update on public.stats
  for each row execute function public.set_updated_at();

alter table public.stats enable row level security;
revoke all on public.stats from anon, authenticated;
grant select on public.stats to anon, authenticated;
grant insert, update, delete on public.stats to authenticated;

create policy "Public read published" on public.stats
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "Admin insert" on public.stats for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admin update" on public.stats for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin delete" on public.stats for delete to authenticated
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Contact form messages
-- Visitors may only INSERT (they can never read messages back). Only admin
-- can read, mark as read, or delete.
-- -----------------------------------------------------------------------------

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(trim(name)) between 1 and 100),
  email      text not null check (
               char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
             ),
  message    text not null check (char_length(trim(message)) between 1 and 5000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant insert (name, email, message) on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

create policy "Anyone can send a message" on public.contact_messages
  for insert to anon, authenticated
  with check (is_read = false);
create policy "Admin read" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "Admin update" on public.contact_messages
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin delete" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));
