-- ============================================================================
-- Full project descriptions
--
-- The structure every established Kenyan health NGO publishes per project —
-- CHAK's CHAP Stawisha page is the clearest example: duration, the counties
-- covered, the purpose, the expected outcomes, who the target populations are,
-- and which local organisations implement it on the ground.
--
-- That combination is what a county health team or a prospective funder reads
-- to decide whether an organisation is real. All of it is entered from the
-- admin; none of it is hardcoded, and anything left blank is omitted from the
-- public page rather than filled with a placeholder.
-- ============================================================================

alter table projects
  -- The counties this project actually operates in. An array rather than free
  -- text so the public site can filter and count by county without parsing.
  add column if not exists counties text[] not null default '{}',
  -- Why the project exists, in the language of its grant agreement.
  add column if not exists purpose text not null default '',
  -- What it is expected to achieve. One outcome per element.
  add column if not exists outcomes text[] not null default '{}',
  -- Who it serves. Kept as free text per element because the sector's
  -- categories are long and overlapping (AGYW, KPs, OVC, PBFW…).
  add column if not exists target_populations text[] not null default '{}',
  -- Sub-components. CHAK calls these pillars; a large project usually has
  -- three or four distinct workstreams under one grant.
  add column if not exists pillars jsonb not null default '[]'::jsonb,
  -- Local organisations delivering on the ground, as {name, county} objects.
  add column if not exists implementing_partners jsonb not null default '[]'::jsonb;

comment on column projects.counties is
  'Counties of operation. Drives the public county filter and the homepage county count — so it must reflect where work actually happens.';

comment on column projects.outcomes is
  'Expected outcomes from the grant agreement or workplan. Never aspirational language written for the website.';

comment on column projects.pillars is
  'Array of {title, body}. The distinct workstreams under this project.';

comment on column projects.implementing_partners is
  'Array of {name, county}. Local organisations delivering on the ground. Naming them is an accountability signal — a community can verify who is actually working in their area.';

-- Counties are filtered on from the public projects listing.
create index if not exists idx_projects_counties on projects using gin (counties);
