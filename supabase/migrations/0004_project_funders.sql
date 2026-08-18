-- ============================================================================
-- Project funders and reporting lines
--
-- The public site offers to show, for each project, who funds it and what it
-- committed to deliver. That is a strong accountability signal — it is what
-- CHAK, Ciheb and every credible Kenyan health NGO publish — but only if the
-- values are real.
--
-- These columns exist so those details are recorded once, by someone with the
-- rights to do it, and rendered from the database. Anything left blank is
-- simply not shown: the site never invents a funder or a target.
-- ============================================================================

alter table projects
  add column if not exists funder text not null default '',
  add column if not exists funder_url text,
  -- What the project committed to deliver, in the project's own words.
  -- Free text rather than a number, because targets are rarely a single figure
  -- ("4,600 girls across 24 schools" is two).
  add column if not exists target text not null default '',
  -- Who the project reports to, where that is a named external body.
  add column if not exists reporting_line text not null default '';

comment on column projects.funder is
  'Publicly named funder. Leave blank if the funder has not agreed to be named, or if there is no single funder — the site omits the field rather than guessing.';

comment on column projects.target is
  'What this project committed to deliver. Must be traceable to a grant agreement or workplan. Never a figure invented for the website.';

-- Funders are shown on the public project listing, so a partial index keeps
-- the "projects with a named funder" query cheap as the archive grows.
create index if not exists idx_projects_funder
  on projects(funder)
  where funder <> '';
