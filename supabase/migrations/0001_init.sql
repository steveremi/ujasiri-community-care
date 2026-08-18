-- ============================================================================
-- Ujasiri Community Care (UCC) — Supabase Postgres schema
--
-- Identity lives in Firebase Auth; this database stores everything else.
-- `profiles.id` is the Firebase UID (a string), and RLS policies read that UID
-- out of the verified Firebase JWT via auth.jwt() ->> 'sub'.
--
-- Prerequisite in the Supabase dashboard:
--   Authentication -> Sign In / Providers -> Third Party Auth -> add Firebase,
--   with your Firebase project ID. Supabase then verifies Firebase-issued JWTs
--   and populates auth.jwt() for these policies.
--
-- Apply with:  supabase db push      (or paste into the SQL editor)
-- ============================================================================

create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Roles and permissions
-- ---------------------------------------------------------------------------

create table if not exists roles (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  label       text not null,
  description text not null default '',
  rank        integer not null default 0,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column roles.rank is
  'Higher outranks lower. A user may never assign a role at or above their own rank — this is what stops privilege escalation by an administrator.';

create table if not exists role_permissions (
  role_id    bigint not null references roles(id) on delete cascade,
  permission text not null,
  primary key (role_id, permission)
);

-- ---------------------------------------------------------------------------
-- Profiles (mirrors Firebase Auth users)
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id                text primary key,            -- Firebase UID
  email             citext not null unique,
  name              text not null default '',
  role_id           bigint not null references roles(id),
  avatar_url        text,
  title             text,
  bio               text,
  phone             text,
  is_active         boolean not null default true,
  email_verified    boolean not null default false,
  last_login_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_profiles_role on profiles(role_id);
create index if not exists idx_profiles_active on profiles(is_active, created_at desc);

-- ---------------------------------------------------------------------------
-- Authorisation helpers
--
-- These run as SECURITY DEFINER so a policy can read the caller's role without
-- the caller needing select rights on roles/role_permissions themselves.
-- ---------------------------------------------------------------------------

create or replace function public.current_uid()
returns text
language sql stable
as $$
  select coalesce(
    auth.jwt() ->> 'sub',          -- Firebase UID
    auth.jwt() ->> 'user_id'
  );
$$;

create or replace function public.has_permission(required text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles p
    join role_permissions rp on rp.role_id = p.role_id
    where p.id = public.current_uid()
      and p.is_active
      and rp.permission = required
  );
$$;

create or replace function public.current_rank()
returns integer
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select r.rank
       from profiles p join roles r on r.id = p.role_id
      where p.id = public.current_uid() and p.is_active),
    0
  );
$$;

-- ---------------------------------------------------------------------------
-- Programmes and projects
-- ---------------------------------------------------------------------------

create table if not exists programs (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  title          text not null,
  summary        text not null default '',
  body           text not null default '',
  icon           text not null default 'HeartHandshake',
  cover_image    text,
  accent         text not null default 'teal',
  status         text not null default 'published'
                 check (status in ('draft','published','archived')),
  sort_order     integer not null default 0,
  people_reached integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_programs_status on programs(status, sort_order);

create table if not exists projects (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  title         text not null,
  program_id    bigint references programs(id) on delete set null,
  summary       text not null default '',
  body          text not null default '',
  cover_image   text,
  location      text not null default '',
  region        text not null default '',
  status        text not null default 'active'
                check (status in ('planned','active','completed')),
  visibility    text not null default 'published'
                check (visibility in ('draft','published','archived')),
  beneficiaries integer not null default 0,
  budget_cents  bigint not null default 0,
  raised_cents  bigint not null default 0,
  started_on    date,
  completed_on  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_projects_listing on projects(visibility, status, created_at desc);
create index if not exists idx_projects_program on projects(program_id);

-- ---------------------------------------------------------------------------
-- Editorial
-- ---------------------------------------------------------------------------

-- News, stories and reports share one table: identical shape, and a single
-- paginated query path to keep fast rather than three.
create table if not exists posts (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  body         text not null default '',
  kind         text not null default 'news' check (kind in ('news','story','report')),
  cover_image  text,
  cover_alt    text not null default '',
  author_id    text references profiles(id) on delete set null,
  program_id   bigint references programs(id) on delete set null,
  status       text not null default 'draft'
               check (status in ('draft','published','archived')),
  featured     boolean not null default false,
  reading_mins integer not null default 3,
  published_at timestamptz,
  seo_title    text,
  seo_desc     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Mirrors the exact public listing query: kind + status, newest first.
create index if not exists idx_posts_listing on posts(kind, status, published_at desc);
create index if not exists idx_posts_author on posts(author_id);
create index if not exists idx_posts_featured on posts(featured, published_at desc)
  where featured;

-- Full-text search across the public archive.
create index if not exists idx_posts_search on posts
  using gin (to_tsvector('english', title || ' ' || excerpt || ' ' || body));

create table if not exists events (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  title       text not null,
  summary     text not null default '',
  body        text not null default '',
  cover_image text,
  venue       text not null default '',
  location    text not null default '',
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  capacity    integer not null default 0,
  status      text not null default 'published'
              check (status in ('draft','published','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_events_when on events(status, starts_at);

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

create table if not exists media (
  id          bigint generated always as identity primary key,
  url         text not null,
  alt         text not null default '',
  caption     text not null default '',
  credit      text not null default '',
  collection  text not null default 'general',
  width       integer,
  height      integer,
  uploaded_by text references profiles(id) on delete set null,
  consent_on_file boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_media_collection on media(collection, created_at desc);

comment on column media.consent_on_file is
  'Safeguarding requirement: photographic consent must be recorded before any image of a beneficiary — especially a child — is published.';

-- ---------------------------------------------------------------------------
-- People and partners
-- ---------------------------------------------------------------------------

create table if not exists team_members (
  id           bigint generated always as identity primary key,
  name         text not null,
  role_title   text not null default '',
  bio          text not null default '',
  photo_url    text,
  group_name   text not null default 'staff'
               check (group_name in ('board','leadership','staff')),
  linkedin     text,
  email        text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists idx_team_group on team_members(group_name, sort_order);

create table if not exists partners (
  id         bigint generated always as identity primary key,
  name       text not null,
  logo_url   text,
  website    text,
  tier       text not null default 'partner'
             check (tier in ('funder','partner','implementing')),
  blurb      text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Supporters
-- ---------------------------------------------------------------------------

create table if not exists donations (
  id           bigint generated always as identity primary key,
  reference    text not null unique,
  donor_name   text not null default '',
  donor_email  citext not null default '',
  user_id      text references profiles(id) on delete set null,
  project_id   bigint references projects(id) on delete set null,
  amount_cents bigint not null check (amount_cents > 0),
  currency     text not null default 'KES',
  frequency    text not null default 'one_off' check (frequency in ('one_off','monthly')),
  method       text not null default 'mpesa' check (method in ('mpesa','card','bank','cash')),
  status       text not null default 'pending'
               check (status in ('pending','completed','failed','refunded')),
  is_anonymous boolean not null default false,
  message      text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_donations_listing on donations(status, created_at desc);
create index if not exists idx_donations_user on donations(user_id);

comment on column donations.amount_cents is
  'Money is stored in minor units as an integer. Never floats.';

create table if not exists volunteer_applications (
  id           bigint generated always as identity primary key,
  name         text not null,
  email        citext not null,
  phone        text not null default '',
  skills       text not null default '',
  availability text not null default '',
  motivation   text not null default '',
  program_id   bigint references programs(id) on delete set null,
  user_id      text references profiles(id) on delete set null,
  status       text not null default 'new'
               check (status in ('new','reviewing','accepted','declined')),
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_volunteers_status on volunteer_applications(status, created_at desc);

create table if not exists contact_messages (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      citext not null,
  subject    text not null default '',
  message    text not null,
  topic      text not null default 'general',
  status     text not null default 'new' check (status in ('new','in_progress','resolved')),
  handled_by text references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_messages_status on contact_messages(status, created_at desc);

create table if not exists subscribers (
  id         bigint generated always as identity primary key,
  email      citext not null unique,
  name       text not null default '',
  source     text not null default 'footer',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Reporting and settings
-- ---------------------------------------------------------------------------

create table if not exists impact_stats (
  id         bigint generated always as identity primary key,
  label      text not null,
  value      bigint not null default 0,
  suffix     text not null default '',
  note       text not null default '',
  icon       text not null default 'Users',
  sort_order integer not null default 0,
  year       integer
);

create table if not exists finance_lines (
  id           bigint generated always as identity primary key,
  year         integer not null,
  category     text not null check (category in ('programmes','admin','fundraising')),
  label        text not null,
  amount_cents bigint not null default 0,
  sort_order   integer not null default 0
);
create index if not exists idx_finance_year on finance_lines(year, sort_order);

comment on table finance_lines is
  'Drives the public "where your money goes" breakdown. Every figure published here must be traceable to the audited report for the same year.';

create table if not exists settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id          bigint generated always as identity primary key,
  actor_id    text references profiles(id) on delete set null,
  actor_email text not null default '',
  action      text not null,
  entity      text not null default '',
  entity_id   text not null default '',
  detail      jsonb not null default '{}'::jsonb,
  ip          text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_recent on audit_log(created_at desc);
create index if not exists idx_audit_actor on audit_log(actor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'roles','profiles','programs','projects','posts','events',
    'donations','volunteer_applications','contact_messages'
  ] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on %1$I;
       create trigger trg_touch_%1$s before update on %1$I
       for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Default deny. The public site reads published rows through the anon key;
-- everything privileged is gated on a permission held by the caller's role.
-- The server-side service-role key bypasses RLS entirely and is used only in
-- Server Actions that have already run their own permission check.
-- ---------------------------------------------------------------------------

alter table roles                  enable row level security;
alter table role_permissions       enable row level security;
alter table profiles               enable row level security;
alter table programs               enable row level security;
alter table projects               enable row level security;
alter table posts                  enable row level security;
alter table events                 enable row level security;
alter table media                  enable row level security;
alter table team_members           enable row level security;
alter table partners               enable row level security;
alter table donations              enable row level security;
alter table volunteer_applications enable row level security;
alter table contact_messages       enable row level security;
alter table subscribers            enable row level security;
alter table impact_stats           enable row level security;
alter table finance_lines          enable row level security;
alter table settings               enable row level security;
alter table audit_log              enable row level security;

-- Public read of published content only.
create policy "public reads published programs" on programs
  for select using (status = 'published');
create policy "public reads published projects" on projects
  for select using (visibility = 'published');
create policy "public reads published posts" on posts
  for select using (status = 'published' and published_at <= now());
create policy "public reads published events" on events
  for select using (status = 'published');
create policy "public reads published team" on team_members
  for select using (is_published);
create policy "public reads partners" on partners for select using (true);
create policy "public reads impact stats" on impact_stats for select using (true);
create policy "public reads finance lines" on finance_lines for select using (true);
create policy "public reads media" on media for select using (true);

-- Staff read drafts and manage content.
create policy "staff read all posts" on posts
  for select using (public.has_permission('content:view'));
create policy "staff insert posts" on posts
  for insert with check (public.has_permission('content:create'));
create policy "staff update posts" on posts
  for update using (
    public.has_permission('content:edit')
    or (public.has_permission('content:edit_own') and author_id = public.current_uid())
  );
create policy "staff delete posts" on posts
  for delete using (public.has_permission('content:delete'));

create policy "staff manage programs" on programs
  for all using (public.has_permission('content:edit'))
  with check (public.has_permission('content:edit'));
create policy "staff manage projects" on projects
  for all using (public.has_permission('content:edit'))
  with check (public.has_permission('content:edit'));
create policy "staff manage events" on events
  for all using (public.has_permission('content:edit'))
  with check (public.has_permission('content:edit'));
create policy "staff manage team" on team_members
  for all using (public.has_permission('content:edit'))
  with check (public.has_permission('content:edit'));
create policy "staff manage partners" on partners
  for all using (public.has_permission('content:edit'))
  with check (public.has_permission('content:edit'));
create policy "staff upload media" on media
  for insert with check (public.has_permission('media:upload'));
create policy "staff delete media" on media
  for delete using (public.has_permission('media:delete'));

-- Profiles: you can always read and edit yourself; staff need the permission.
create policy "read own profile" on profiles
  for select using (id = public.current_uid());
create policy "update own profile" on profiles
  for update using (id = public.current_uid())
  with check (id = public.current_uid());
create policy "staff read profiles" on profiles
  for select using (public.has_permission('users:view'));
create policy "staff update profiles" on profiles
  for update using (public.has_permission('users:edit'));

create policy "read roles" on roles
  for select using (public.has_permission('roles:view') or public.has_permission('users:view'));
create policy "manage roles" on roles
  for all using (public.has_permission('roles:manage'))
  with check (public.has_permission('roles:manage'));
create policy "read role permissions" on role_permissions
  for select using (public.has_permission('roles:view') or public.has_permission('users:view'));
create policy "manage role permissions" on role_permissions
  for all using (public.has_permission('roles:manage'))
  with check (public.has_permission('roles:manage'));

-- Supporter data: anyone may submit; only the right staff may read.
create policy "anyone submits volunteer application" on volunteer_applications
  for insert with check (true);
create policy "staff read volunteers" on volunteer_applications
  for select using (public.has_permission('volunteers:view'));
create policy "staff manage volunteers" on volunteer_applications
  for update using (public.has_permission('volunteers:manage'));
create policy "donor reads own applications" on volunteer_applications
  for select using (user_id = public.current_uid());

create policy "anyone submits enquiry" on contact_messages
  for insert with check (true);
create policy "staff read enquiries" on contact_messages
  for select using (public.has_permission('messages:view'));
create policy "staff manage enquiries" on contact_messages
  for update using (public.has_permission('messages:manage'));

create policy "anyone subscribes" on subscribers
  for insert with check (true);
create policy "staff read subscribers" on subscribers
  for select using (public.has_permission('subscribers:view'));
create policy "staff manage subscribers" on subscribers
  for all using (public.has_permission('subscribers:manage'))
  with check (public.has_permission('subscribers:manage'));

-- Donations are never publicly readable. Donors see only their own.
create policy "donor reads own donations" on donations
  for select using (user_id = public.current_uid());
create policy "finance reads donations" on donations
  for select using (public.has_permission('donations:view'));
create policy "finance manages donations" on donations
  for all using (public.has_permission('donations:manage'))
  with check (public.has_permission('donations:manage'));

create policy "staff read settings" on settings
  for select using (public.has_permission('settings:view'));
create policy "staff manage settings" on settings
  for all using (public.has_permission('settings:manage'))
  with check (public.has_permission('settings:manage'));

create policy "staff read audit" on audit_log
  for select using (public.has_permission('audit:view'));
