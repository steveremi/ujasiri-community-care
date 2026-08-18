-- ============================================================================
-- Built-in roles and their permission grants.
--
-- Mirrors src/lib/auth/rbac.ts. That file is the source of truth the
-- application reasons about; this migration is what the database enforces.
-- If you change one, change the other — `npm run check:rbac` diffs them.
-- ============================================================================

insert into roles (name, label, description, rank, is_system) values
  ('SUPER_ADMIN', 'Super Admin', 'Full control, including roles and settings. Held by the founding account and cannot be removed from the last remaining super admin.', 100, true),
  ('ADMIN', 'Administrator', 'Runs day-to-day operations across content, people and supporters.', 80, true),
  ('EDITOR', 'Editor', 'Owns the public voice: writes, edits and publishes all content.', 60, true),
  ('FINANCE', 'Finance Officer', 'Handles donation records and financial reporting. No content access.', 50, true),
  ('COORDINATOR', 'Volunteer Coordinator', 'Reviews volunteer applications and answers enquiries.', 45, true),
  ('AUTHOR', 'Author', 'Drafts stories and news. Can edit their own work but cannot publish it.', 40, true),
  ('MEMBER', 'Member', 'A registered supporter. Can sign in to see their own giving history and volunteer applications, but has no admin access.', 10, true)
on conflict (name) do update
  set label = excluded.label,
      description = excluded.description,
      rank = excluded.rank,
      is_system = excluded.is_system;

-- Rebuild system-role grants from scratch so this migration is idempotent and
-- always converges on the matrix below.
delete from role_permissions
 where role_id in (select id from roles where is_system);

-- SUPER_ADMIN holds every permission that exists.
insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('content:view'),('content:create'),('content:edit'),('content:edit_own'),
  ('content:delete'),('content:publish'),
  ('media:view'),('media:upload'),('media:delete'),
  ('users:view'),('users:create'),('users:edit'),('users:delete'),('users:assign_roles'),
  ('roles:view'),('roles:manage'),
  ('donations:view'),('donations:manage'),
  ('volunteers:view'),('volunteers:manage'),
  ('messages:view'),('messages:manage'),
  ('subscribers:view'),('subscribers:manage'),
  ('settings:view'),('settings:manage'),
  ('audit:view')
) as p(permission)
where r.name = 'SUPER_ADMIN';

insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('content:view'),('content:create'),('content:edit'),('content:delete'),('content:publish'),
  ('media:view'),('media:upload'),('media:delete'),
  ('users:view'),('users:create'),('users:edit'),
  ('roles:view'),
  ('donations:view'),('donations:manage'),
  ('volunteers:view'),('volunteers:manage'),
  ('messages:view'),('messages:manage'),
  ('subscribers:view'),('subscribers:manage'),
  ('settings:view'),
  ('audit:view')
) as p(permission)
where r.name = 'ADMIN';

insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('content:view'),('content:create'),('content:edit'),('content:delete'),('content:publish'),
  ('media:view'),('media:upload'),('media:delete'),
  ('messages:view')
) as p(permission)
where r.name = 'EDITOR';

insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('content:view'),('content:create'),('content:edit_own'),
  ('media:view'),('media:upload')
) as p(permission)
where r.name = 'AUTHOR';

insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('donations:view'),('donations:manage'),
  ('subscribers:view'),
  ('audit:view')
) as p(permission)
where r.name = 'FINANCE';

insert into role_permissions (role_id, permission)
select r.id, p.permission
from roles r
cross join (values
  ('volunteers:view'),('volunteers:manage'),
  ('messages:view'),('messages:manage'),
  ('content:view')
) as p(permission)
where r.name = 'COORDINATOR';

-- MEMBER intentionally holds no permissions: a supporter account with no
-- admin reach. Their access to their own donations comes from an RLS policy
-- keyed on user_id, not from a permission grant.

-- ---------------------------------------------------------------------------
-- Bootstrap guard
--
-- The very first account to register claims SUPER_ADMIN; every later account
-- defaults to MEMBER. This flag is flipped by that first registration inside a
-- transaction, so two simultaneous sign-ups cannot both win the race.
-- ---------------------------------------------------------------------------

insert into settings (key, value) values
  ('bootstrap', '{"claimed": false}'::jsonb),
  ('registration', '{"open": true, "default_role": "MEMBER"}'::jsonb)
on conflict (key) do nothing;

create or replace function public.claim_superadmin(uid text, user_email text, user_name text)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  claimed boolean;
  target_role bigint;
  target_name text;
begin
  -- Lock the bootstrap row so concurrent registrations serialise here.
  select (value ->> 'claimed')::boolean into claimed
    from settings where key = 'bootstrap' for update;

  if claimed is distinct from true then
    select id into target_role from roles where name = 'SUPER_ADMIN';
    target_name := 'SUPER_ADMIN';
    update settings set value = '{"claimed": true}'::jsonb, updated_at = now()
     where key = 'bootstrap';
  else
    select id into target_role from roles where name = 'MEMBER';
    target_name := 'MEMBER';
  end if;

  insert into profiles (id, email, name, role_id, email_verified)
  values (uid, user_email, user_name, target_role, false)
  on conflict (id) do update set email = excluded.email, name = excluded.name;

  insert into audit_log (actor_id, actor_email, action, entity, entity_id, detail)
  values (uid, user_email, 'auth.register', 'profile', uid,
          jsonb_build_object('role', target_name));

  return target_name;
end;
$$;
