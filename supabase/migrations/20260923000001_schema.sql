-- =============================================================================
-- Portfolio schema: content tables, admin membership, and Row Level Security.
--
-- Access model:
--   * Visitors (anon) can only READ published content.
--   * Only users listed in public.admin_users can create, update, or delete.
--   * No service-role key is ever needed by the browser app.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin membership
-- Rows are added manually in the SQL editor (see supabase/admin/grant_admin.sql).
-- There are no insert/update/delete policies, so nobody can add themselves
-- through the API.
-- -----------------------------------------------------------------------------

create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Singletons: profile and site settings (exactly one row each, id = 1)
-- -----------------------------------------------------------------------------

create table public.profile (
  id            smallint primary key default 1 check (id = 1),
  full_name     text not null default '',
  headline      text not null default '',
  about         text not null default '',
  location      text not null default '',
  contact_email text,
  avatar_path   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.site_settings (
  id                smallint primary key default 1 check (id = 1),
  site_title        text not null default '',
  meta_description  text not null default '',
  og_image_path     text,
  -- Current resume in the "resumes" bucket. Each upload uses a new file name,
  -- so this pointer always gives visitors the latest resume (no stale cache).
  resume_path       text,
  resume_file_name  text,
  resume_updated_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Content tables
-- URL columns only accept http(s)/mailto links, so a javascript: URL can never
-- be rendered into a public link.
-- -----------------------------------------------------------------------------

create table public.experiences (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  role            text not null,
  employment_type text,
  location        text,
  company_url     text check (company_url ~* '^https?://'),
  logo_path       text,
  start_date      date not null,
  end_date        date,
  is_current      boolean not null default false,
  description     text not null default '',
  display_order   integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  check (not (is_current and end_date is not null))
);

create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary        text not null default '',
  description    text not null default '',
  thumbnail_path text,
  live_url       text check (live_url ~* '^https?://'),
  github_url     text check (github_url ~* '^https?://'),
  is_featured    boolean not null default false,
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.technologies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index technologies_name_key on public.technologies (lower(name));

create table public.project_technologies (
  project_id    uuid not null references public.projects (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  primary key (project_id, technology_id)
);

create index project_technologies_technology_id_idx
  on public.project_technologies (technology_id);

create table public.skill_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) > 0),
  display_order integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index skill_categories_name_key on public.skill_categories (lower(name));

create table public.skills (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.skill_categories (id) on delete cascade,
  name          text not null check (length(trim(name)) > 0),
  display_order integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index skills_category_name_key on public.skills (category_id, lower(name));

create table public.education (
  id             uuid primary key default gen_random_uuid(),
  institution    text not null,
  degree         text not null,
  field_of_study text,
  location       text,
  grade          text,
  logo_path      text,
  start_date     date,
  end_date       date,
  description    text not null default '',
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.certifications (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  issuer         text not null,
  issue_date     date,
  expiry_date    date,
  credential_id  text,
  credential_url text check (credential_url ~* '^https?://'),
  image_path     text,
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (expiry_date is null or issue_date is null or expiry_date >= issue_date)
);

create table public.achievements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null default '',
  achieved_on   date,
  url           text check (url ~* '^https?://'),
  image_path    text,
  display_order integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.social_links (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null
                check (platform in ('github', 'linkedin', 'leetcode', 'email', 'twitter', 'website', 'other')),
  label         text not null,
  url           text not null check (url ~* '^(https?://|mailto:)'),
  display_order integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes for public ordering queries
-- -----------------------------------------------------------------------------

create index experiences_order_idx    on public.experiences (display_order);
create index projects_order_idx       on public.projects (display_order);
create index skills_category_id_idx   on public.skills (category_id, display_order);
create index education_order_idx      on public.education (display_order);
create index certifications_order_idx on public.certifications (display_order);
create index achievements_order_idx   on public.achievements (display_order);
create index social_links_order_idx   on public.social_links (display_order);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'profile', 'site_settings', 'experiences', 'projects', 'technologies',
    'skill_categories', 'skills', 'education', 'certifications',
    'achievements', 'social_links'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Privileges. RLS below is the real gate; grants are kept explicit so
-- visitors can never write even if a policy were misconfigured.
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_users', 'profile', 'site_settings', 'experiences', 'projects',
    'technologies', 'project_technologies', 'skill_categories', 'skills',
    'education', 'certifications', 'achievements', 'social_links'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end;
$$;

grant select on public.admin_users to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profile', 'site_settings', 'experiences', 'projects', 'technologies',
    'project_technologies', 'skill_categories', 'skills', 'education',
    'certifications', 'achievements', 'social_links'
  ]
  loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS policies
-- -----------------------------------------------------------------------------

-- admin_users: a signed-in user may only see whether they themselves are admin.
create policy "Users can read their own admin row"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

-- Singletons: always publicly readable; only admin can update.
-- (Rows are seeded below; no insert/delete policy is needed.)
create policy "Public read" on public.profile
  for select to anon, authenticated using (true);
create policy "Admin update" on public.profile
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Admin update" on public.site_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Tables with is_published: visitors see published rows, admin sees everything.
do $$
declare
  t text;
begin
  foreach t in array array[
    'experiences', 'projects', 'skill_categories', 'education',
    'certifications', 'achievements', 'social_links'
  ]
  loop
    execute format(
      'create policy "Public read published" on public.%I
         for select to anon, authenticated
         using (is_published or (select public.is_admin()))', t);
  end loop;
end;
$$;

-- Skills are visible only when both the skill and its category are published.
create policy "Public read published" on public.skills
  for select to anon, authenticated
  using (
    (
      is_published
      and exists (
        select 1 from public.skill_categories c
        where c.id = category_id and c.is_published
      )
    )
    or (select public.is_admin())
  );

-- Technologies are just tag names; always readable.
create policy "Public read" on public.technologies
  for select to anon, authenticated using (true);

-- A project's tags are visible when the project is visible.
create policy "Public read for published projects" on public.project_technologies
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published
    )
    or (select public.is_admin())
  );

-- Admin write access on every content table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'experiences', 'projects', 'technologies', 'project_technologies',
    'skill_categories', 'skills', 'education', 'certifications',
    'achievements', 'social_links'
  ]
  loop
    execute format(
      'create policy "Admin insert" on public.%I for insert to authenticated
         with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admin update" on public.%I for update to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admin delete" on public.%I for delete to authenticated
         using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Seed singleton rows
-- -----------------------------------------------------------------------------

insert into public.profile (id, full_name)
values (1, 'Mayank Kumar Singh')
on conflict (id) do nothing;

insert into public.site_settings (id, site_title, meta_description)
values (
  1,
  'Mayank Kumar Singh | Portfolio',
  'Portfolio of Mayank Kumar Singh: experience, projects, skills, and resume.'
)
on conflict (id) do nothing;
