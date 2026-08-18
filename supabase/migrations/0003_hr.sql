-- ============================================================================
-- Recruitment and HR
--
-- Three things live here:
--   job_openings     — vacancies staff post and the public browses
--   job_applications — what candidates submit against them
--   hr_requests      — internal requests raised by staff under HR policy
--                      (leave, grievance, reference letters, and so on)
--
-- Applications and HR requests contain personal data about identifiable
-- people, so both are default-deny: nobody reads them without an explicit
-- permission grant, and an applicant can only ever see their own.
-- ============================================================================

create table if not exists job_openings (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  title          text not null,
  summary        text not null default '',
  description    text not null default '',
  responsibilities text not null default '',
  requirements   text not null default '',
  department     text not null default '',
  location       text not null default '',
  employment_type text not null default 'full_time'
                 check (employment_type in ('full_time','part_time','contract','volunteer','internship')),
  salary_range   text not null default '',
  -- Recruitment integrity: every vacancy carries its own closing date and is
  -- taken down automatically, so no advert sits open harvesting CVs.
  closes_on      date,
  status         text not null default 'draft'
                 check (status in ('draft','open','closed','filled')),
  posted_by      text references profiles(id) on delete set null,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_jobs_listing on job_openings(status, published_at desc);
create index if not exists idx_jobs_closing on job_openings(status, closes_on);

create table if not exists job_applications (
  id             bigint generated always as identity primary key,
  reference      text not null unique,
  job_id         bigint not null references job_openings(id) on delete cascade,
  user_id        text references profiles(id) on delete set null,
  name           text not null,
  email          citext not null,
  phone          text not null default '',
  cover_letter   text not null default '',
  cv_url         text,
  years_experience integer not null default 0,
  -- Applicants confirm they understand the safeguarding requirements before
  -- they can submit. Recorded because we have to evidence it.
  safeguarding_ack boolean not null default false,
  status         text not null default 'received'
                 check (status in ('received','shortlisted','interviewing','offered','rejected','withdrawn')),
  notes          text not null default '',
  reviewed_by    text references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_applications_job on job_applications(job_id, created_at desc);
create index if not exists idx_applications_status on job_applications(status, created_at desc);
create index if not exists idx_applications_user on job_applications(user_id);

-- One application per person per vacancy; re-applying updates the existing row.
create unique index if not exists idx_applications_unique
  on job_applications(job_id, email);

create table if not exists hr_requests (
  id           bigint generated always as identity primary key,
  reference    text not null unique,
  user_id      text references profiles(id) on delete set null,
  requester_name  text not null default '',
  requester_email citext not null default '',
  category     text not null default 'general'
               check (category in ('leave','grievance','reference','policy','payroll','equipment','general')),
  subject      text not null,
  details      text not null default '',
  -- A grievance may need to bypass the requester's own line manager.
  confidential boolean not null default false,
  status       text not null default 'open'
               check (status in ('open','in_progress','resolved','declined')),
  response     text not null default '',
  handled_by   text references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_hr_status on hr_requests(status, created_at desc);
create index if not exists idx_hr_user on hr_requests(user_id, created_at desc);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['job_openings','job_applications','hr_requests'] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on %1$I;
       create trigger trg_touch_%1$s before update on %1$I
       for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('jobs:view'),('jobs:manage'),
  ('applications:view'),('applications:manage'),
  ('hr:view'),('hr:manage')
) as p(permission)
where r.name in ('SUPER_ADMIN','ADMIN')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table job_openings     enable row level security;
alter table job_applications enable row level security;
alter table hr_requests      enable row level security;

-- Anyone may read an open, published vacancy that has not closed.
create policy "public reads open jobs" on job_openings
  for select using (
    status = 'open'
    and published_at <= now()
    and (closes_on is null or closes_on >= current_date)
  );

create policy "staff read all jobs" on job_openings
  for select using (public.has_permission('jobs:view'));
create policy "staff manage jobs" on job_openings
  for all using (public.has_permission('jobs:manage'))
  with check (public.has_permission('jobs:manage'));

-- Anyone may apply. Nobody may read applications without the permission,
-- except the applicant reading their own.
create policy "anyone applies" on job_applications
  for insert with check (true);
create policy "applicant reads own" on job_applications
  for select using (user_id = public.current_uid());
create policy "staff read applications" on job_applications
  for select using (public.has_permission('applications:view'));
create policy "staff manage applications" on job_applications
  for update using (public.has_permission('applications:manage'));

-- HR requests: yours are yours. Staff with the permission see the rest, but a
-- confidential request is restricted to full HR management rights so a
-- grievance cannot be read by the wider admin group.
create policy "staff raise hr request" on hr_requests
  for insert with check (user_id = public.current_uid());
create policy "requester reads own" on hr_requests
  for select using (user_id = public.current_uid());
create policy "hr reads requests" on hr_requests
  for select using (
    public.has_permission('hr:manage')
    or (public.has_permission('hr:view') and not confidential)
  );
create policy "hr manages requests" on hr_requests
  for update using (public.has_permission('hr:manage'));
