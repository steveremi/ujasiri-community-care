/**
 * Verify the application's permission model matches the database.
 *
 *   npm run check:rbac
 *
 * src/lib/auth/rbac.ts is what the application reasons about; the grants in
 * supabase/migrations/0002_seed_roles.sql are what the database actually
 * enforces through row-level security. These can drift — someone adds a
 * permission to a role in TypeScript, forgets the migration, and the UI shows
 * a button the database then refuses to honour.
 *
 * That failure is quiet and confusing, so this check makes it loud. Run it in
 * CI. Exits non-zero on any mismatch.
 */

import { createClient } from "@supabase/supabase-js";

import { ALL_PERMISSIONS, SYSTEM_ROLES } from "../src/lib/auth/rbac";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("  Missing Supabase credentials — set them in .env.local.");
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data, error } = await db
    .from("roles")
    .select("name, rank, role_permissions(permission)");

  if (error) {
    console.error(`  Could not read roles: ${error.message}`);
    process.exit(1);
  }

  const problems: string[] = [];

  const dbRoles = new Map(
    (data ?? []).map((row) => [
      row.name as string,
      {
        rank: row.rank as number,
        permissions: new Set(
          ((row.role_permissions ?? []) as { permission: string }[]).map((p) => p.permission),
        ),
      },
    ]),
  );

  for (const role of Object.values(SYSTEM_ROLES)) {
    const inDb = dbRoles.get(role.name);

    if (!inDb) {
      problems.push(`Role ${role.name} exists in rbac.ts but not in the database.`);
      continue;
    }

    if (inDb.rank !== role.rank) {
      problems.push(
        `Role ${role.name}: rank is ${role.rank} in rbac.ts but ${inDb.rank} in the database. ` +
          `Rank decides who may assign which role, so a mismatch here is a privilege-escalation risk.`,
      );
    }

    const expected = new Set<string>(role.permissions);

    for (const permission of expected) {
      if (!inDb.permissions.has(permission)) {
        problems.push(
          `Role ${role.name}: rbac.ts grants "${permission}" but the database does not. ` +
            `The UI will offer this and the database will refuse it.`,
        );
      }
    }

    for (const permission of inDb.permissions) {
      if (!expected.has(permission)) {
        problems.push(
          `Role ${role.name}: the database grants "${permission}" but rbac.ts does not. ` +
            `This is an unintended privilege — the database is the thing that enforces it.`,
        );
      }
    }
  }

  // A permission granted in the database that the application has never heard
  // of is dead weight at best and a forgotten grant at worst.
  const known = new Set<string>(ALL_PERMISSIONS);
  for (const [name, role] of dbRoles) {
    for (const permission of role.permissions) {
      if (!known.has(permission)) {
        problems.push(
          `Role ${name}: the database grants "${permission}", which does not exist in rbac.ts.`,
        );
      }
    }
  }

  if (problems.length === 0) {
    console.log(
      `\n  ✓ RBAC in step: ${Object.keys(SYSTEM_ROLES).length} roles, ` +
        `${ALL_PERMISSIONS.length} permissions, no drift.\n`,
    );
    return;
  }

  console.error(`\n  ✗ ${problems.length} RBAC mismatch(es):\n`);
  for (const problem of problems) console.error(`    • ${problem}`);
  console.error(
    "\n  Fix by updating supabase/migrations/0002_seed_roles.sql and re-applying it,\n" +
      "  or by correcting src/lib/auth/rbac.ts — whichever is wrong.\n",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("  Check failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
