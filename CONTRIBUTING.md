# Contributing

## Before you push

```bash
npm run verify   # typecheck + lint — CI runs the same thing, plus a build
```

## Workflow

`main` is deployed. Every push to it goes to production, so work on a branch and
open a pull request.

```bash
git switch -c fix/donate-validation
# ... work ...
npm run verify
git push -u origin fix/donate-validation
gh pr create --fill
```

Every branch gets its own Vercel preview URL, posted to the pull request. Check the
preview before merging — it is the same build that will go to production.

## Things that will get a pull request sent back

- **Secrets in the diff.** No `.env.local`, no keys, no service-account JSON. The
  `.gitignore` excludes all `.env*` files except the template; do not weaken it.
- **`SUPABASE_SERVICE_ROLE_KEY` reaching the client.** It bypasses Row Level Security.
  Server-only, behind a permission check, never in a Client Component.
- **Authorisation in `src/proxy.ts`.** The proxy is a UX shortcut, not a security
  boundary. Real checks go in the Data Access Layer, `src/lib/auth/dal.ts`.
- **Placeholder data presented as real.** Invented impact figures, invented client
  stories, or a dash standing in for a number nobody has. If a figure is not recorded,
  the site omits it. See `src/lib/fixtures/content.ts`.
- **Client-identifying content.** Anything naming, photographing or locating a service
  user needs written informed consent. `src/lib/safeguarding.ts` will warn you; the
  warning is not a formality.

## Content and admin changes

Content is edited in the admin at `/admin` by someone holding the relevant permission,
not by editing source files. Every change is written to the audit log. If you find
yourself editing content in a `.tsx` file, that is usually a sign the field belongs in
the database instead.

## Next.js version

This project is on Next.js 16, which has breaking changes from earlier versions —
`middleware` is now `proxy`, and `authInterrupts` is enabled for `forbidden()` and
`unauthorized()`. Check `node_modules/next/dist/docs/` before assuming an API works the
way it did in 14 or 15.
