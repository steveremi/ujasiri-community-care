# Partner logos

Drop a real logo file in this folder and set `logo_url` on that partner. Nothing
else needs to change — the UI switches from monogram to logo on its own.

Where a partner has no file here, `PartnerMark`
(`src/components/site/partner-logo.tsx`) draws a monogram from their initials.
That is a deliberate fallback, not a gap waiting to be filled with something
approximate: we publish this list so a community can verify that a referral door
is real, and a redrawn county emblem or an invented NGO mark would defeat the
whole point. For the Ministry of Health and the county governments it would also
be a forged official emblem. **Use the organisation's own file or the monogram —
never a lookalike.**

## Where the file gets set

Two places, depending on how the site is running:

- **Demo mode** (no Supabase keys) — `src/lib/fixtures/content.ts`, the
  `partners` array.
- **Live** — the `partners` table, editable from the admin.

## Expected filenames

Keep the naming consistent so the folder stays readable. `.svg` is preferred
(sharp at any size, tiny); `.png` with a transparent background is fine.

| Partner | File | Where the official asset comes from |
| --- | --- | --- |
| Ministry of Health | `ministry-of-health.svg` | https://www.health.go.ke — request from the comms desk at Afya House |
| County Government of Kisumu | `kisumu-county.png` ✅ present | https://www.kisumu.go.ke |
| Kilifi County Referral Hospital | `kilifi-referral-hospital.svg` | County comms, https://kilifi.go.ke |
| National TB Programme | `national-tb-programme.svg` | https://nltp.co.ke |
| Stawisha Care | `stawisha-care.svg` | Partner contact |
| Gender Violence Recovery Centre | `gvrc.svg` | https://gvrc.or.ke |
| Kenya Legal Aid Network | `kenya-legal-aid-network.svg` | Partner contact |
| Global Health Fund | `global-health-fund.svg` | Funder's brand pack — funders usually mandate a specific lockup, so ask before publishing |
| Alvania Group | `alvania-group.svg` | https://alvaniagroup.com |

## Before you publish someone else's logo

- Get permission. A logo is a trademark, and displaying it asserts a
  relationship. For funders this is usually contractual — most grant agreements
  specify which lockup you may use and how.
- Use the version they give you. Don't recolour, stretch, or trace it.
- Trim the file's own padding. `PartnerMark` renders inside a square with its
  own padding, so built-in whitespace makes the mark look shrunken next to the
  others.
- Aim for roughly 240px on the long edge for raster files.

## If a partnership ends

Remove the row, not just the logo. A stale entry on this page is a false claim
about where we can send someone.
