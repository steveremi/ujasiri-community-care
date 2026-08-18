-- ============================================================================
-- Health indicators
--
-- What the public site should show instead of a spending breakdown: the state
-- of the epidemic in the areas we work, the coverage our programmes achieve,
-- and whether either is moving.
--
-- Spending is reported to the board, the regulator and our funders. It is not
-- something a community health NGO needs to publish line by line, and doing so
-- invites a reader to judge the work by its overheads rather than its results.
-- What belongs in public is whether people are getting tested, treated and
-- staying in care.
--
-- Every figure here needs a source before it can be published — see the
-- `source` column, which the public site checks.
-- ============================================================================

create table if not exists health_indicators (
  id           bigint generated always as identity primary key,

  -- Grouping, so the public page can render one chart per theme.
  category     text not null default 'prevalence'
               check (category in ('prevalence','prevention','treatment','screening','coverage')),

  label        text not null,
  -- Optional sub-label, e.g. the population the figure applies to.
  segment      text not null default '',

  -- Stored as a plain number with an explicit unit, because these are a mix of
  -- percentages, counts and rates and forcing them into one type loses meaning.
  value        numeric not null,
  unit         text not null default 'percent' check (unit in ('percent','count','rate')),

  -- The period this figure describes.
  period       text not null default '',
  year         integer,

  -- Where it came from. The public site refuses to render an indicator with an
  -- empty source — an unattributed health statistic is worse than none.
  source       text not null default '',
  source_url   text,

  -- The direction that counts as improvement, so the UI can colour a change
  -- correctly. Falling HIV incidence is good; falling treatment coverage is not.
  better       text not null default 'lower' check (better in ('lower','higher')),

  -- Optional comparison point, so the page can show movement rather than a
  -- single static number.
  baseline_value numeric,
  baseline_period text not null default '',

  county       text not null default '',
  sort_order   integer not null default 0,
  is_published boolean not null default false,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_indicators_public
  on health_indicators(is_published, category, sort_order);

comment on table health_indicators is
  'Epidemiological and programme-coverage figures shown publicly. Replaces the spending breakdown: what a community needs from this site is whether people are being reached and staying in care, not how the budget was divided.';

comment on column health_indicators.source is
  'Required before publication. The public page will not render an indicator with no source — an unattributed health statistic is worse than no statistic.';

drop trigger if exists trg_touch_health_indicators on health_indicators;
create trigger trg_touch_health_indicators before update on health_indicators
  for each row execute function public.touch_updated_at();

-- --- Row Level Security -----------------------------------------------------

alter table health_indicators enable row level security;

-- Public reads published, sourced indicators only. The source check is enforced
-- in the database as well as the UI, so a figure cannot reach the public site
-- unattributed even if a page forgets to filter.
create policy "public reads sourced indicators" on health_indicators
  for select using (is_published and source <> '');

create policy "staff read all indicators" on health_indicators
  for select using (public.has_permission('content:view'));

create policy "staff manage indicators" on health_indicators
  for all using (public.has_permission('content:edit'))
  with check (public.has_permission('content:edit'));

-- --- Finance lines are no longer public -------------------------------------
--
-- Spending goes to the board, the regulator and funders. Dropping the public
-- read policy means the anon key cannot retrieve it at all, which is a stronger
-- guarantee than removing the component that rendered it.

drop policy if exists "public reads finance lines" on finance_lines;

create policy "staff read finance lines" on finance_lines
  for select using (public.has_permission('settings:view'));
