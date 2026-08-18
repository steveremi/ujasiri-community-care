/**
 * Seed the Supabase database.
 *
 *   npm run seed          — insert content that does not already exist
 *   npm run seed -- --force  — overwrite existing rows with the same slug
 *
 * This pushes the content in src/lib/fixtures into the real database, so the
 * site stops running on fallbacks and starts running on rows you can edit from
 * the admin. It is idempotent: running it twice does not duplicate anything.
 *
 * It deliberately does NOT create user accounts. The first Super Admin is
 * claimed by whoever registers first through the sign-up form, inside a
 * transaction — seeding one here would bypass that and leave an account whose
 * password nobody set.
 *
 * The numbers it inserts are illustrative. Replace them with figures from your
 * own M&E data before the site goes public.
 */

import { createClient } from "@supabase/supabase-js";

import {
  events,
  financeLines,
  impactStats,
  jobOpenings,
  partners,
  posts,
  programs,
  projects,
  team,
} from "../src/lib/fixtures/content";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const force = process.argv.includes("--force");

if (!url || !key) {
  console.error(
    "\n  Missing credentials.\n\n" +
      "  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local,\n" +
      "  then run the migrations in supabase/migrations/ before seeding.\n",
  );
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Strip the fields the database generates for itself. */
function stripIds<T extends { id?: unknown }>(rows: T[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return rows.map(({ id, ...rest }) => rest);
}

async function seed(
  table: string,
  rows: Record<string, unknown>[],
  conflictColumn?: string,
) {
  if (rows.length === 0) return;

  const query = conflictColumn
    ? db.from(table).upsert(rows, {
        onConflict: conflictColumn,
        // Without --force, existing rows are left exactly as they are. Someone
        // may have edited them in the admin, and a seed script must never
        // silently discard real work.
        ignoreDuplicates: !force,
      })
    : db.from(table).insert(rows);

  const { error } = await query;

  if (error) {
    console.error(`  ✗ ${table.padEnd(22)} ${error.message}`);
    return;
  }
  console.log(`  ✓ ${table.padEnd(22)} ${rows.length} rows`);
}

async function main() {
  console.log(`\n  Seeding Ujasiri Community Care${force ? " (force: overwriting)" : ""}\n`);

  // Order matters: projects reference programmes, posts reference programmes.
  await seed("programs", stripIds(programs), "slug");

  // Re-read the programmes so child rows point at real generated ids rather
  // than the fixture ids, which the database never assigned.
  const { data: savedPrograms } = await db.from("programs").select("id, slug");
  const programIdBySlug = new Map(
    (savedPrograms ?? []).map((p) => [p.slug as string, p.id as number]),
  );
  const fixtureSlugById = new Map(programs.map((p) => [p.id, p.slug]));

  const remapProgram = (fixtureProgramId: number | null) => {
    if (fixtureProgramId == null) return null;
    const slug = fixtureSlugById.get(fixtureProgramId);
    return slug ? (programIdBySlug.get(slug) ?? null) : null;
  };

  await seed(
    "projects",
    stripIds(projects).map((p) => ({
      ...p,
      program_id: remapProgram(p.program_id as number | null),
    })),
    "slug",
  );

  await seed(
    "posts",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stripIds(posts).map(({ author_name, ...p }) => ({
      ...p,
      program_id: remapProgram(p.program_id as number | null),
      // Authorship is attached in the admin once real accounts exist.
      author_id: null,
    })),
    "slug",
  );

  await seed("events", stripIds(events), "slug");
  await seed("team_members", stripIds(team));
  await seed("partners", stripIds(partners));
  await seed("impact_stats", stripIds(impactStats));
  await seed("finance_lines", stripIds(financeLines));
  await seed("job_openings", stripIds(jobOpenings), "slug");

  console.log(
    "\n  Done.\n\n" +
      "  Next: register the first account at /register — it claims Super Admin.\n" +
      "  Then replace the seeded figures with numbers you can evidence.\n",
  );
}

main().catch((err) => {
  console.error("\n  Seed failed:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
