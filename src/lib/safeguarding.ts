/**
 * Safeguarding rules, expressed as code.
 *
 * UCC works in HIV, TB and gender-based violence. Being publicly identified in
 * connection with any of those can cost someone their job, their family or
 * their safety — so the organisation's safeguarding policy is not only a
 * document staff are asked to remember. The parts of it that a content system
 * can enforce are enforced here, and called from the publishing paths.
 *
 * This module is intentionally conservative. It produces warnings, not silent
 * rewrites: a human decides what to publish, but they do so having been told.
 */

/** Severity of a safeguarding finding. */
export type Severity = "block" | "warn";

export interface SafeguardingIssue {
  severity: Severity;
  field: string;
  message: string;
}

/**
 * Terms that, appearing near a person's name, suggest a story is disclosing an
 * individual's health status or experience of violence. Deliberately broad —
 * a false positive costs an editor ten seconds; a false negative can cost
 * somebody far more.
 */
const SENSITIVE_TERMS = [
  "hiv positive",
  "hiv-positive",
  "living with hiv",
  "tested positive",
  "seropositive",
  "on art",
  "antiretroviral",
  "viral load",
  "tb patient",
  "tuberculosis patient",
  "rape",
  "raped",
  "sexual assault",
  "defiled",
  "defilement",
  "survivor of",
  "her attacker",
  "his attacker",
  "cancer diagnosis",
  "diagnosed with",
];

/** Words that mark a subject as a child, who needs stricter handling again. */
const CHILD_TERMS = [
  "child",
  "children",
  "girl",
  "boy",
  "pupil",
  "learner",
  "minor",
  "adolescent",
  "teenager",
  "aged 1",
  "-year-old",
  "year old",
];

/**
 * Rough detector for a full personal name: two or more capitalised words in a
 * row. It will flag "Kilifi County Hospital" too, which is the right trade-off
 * — a moment's review beats an unreviewed disclosure.
 */
const FULL_NAME = /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g;

/** Kenyan phone numbers and email addresses have no business in public copy. */
const PHONE = /(?:\+?254|0)7\d{2}[\s-]?\d{3}[\s-]?\d{3}/g;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/g;

function includesAny(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  return needles.filter((n) => lower.includes(n));
}

/**
 * Check a piece of content before it is published.
 *
 * `block` findings should prevent publication outright. `warn` findings should
 * require the editor to confirm they have consent on file.
 */
export function checkContent(input: {
  title: string;
  body: string;
  excerpt?: string;
  hasConsentOnFile?: boolean;
}): SafeguardingIssue[] {
  const issues: SafeguardingIssue[] = [];
  const text = `${input.title}\n${input.excerpt ?? ""}\n${input.body}`;

  const sensitive = includesAny(text, SENSITIVE_TERMS);
  const names = [...new Set(text.match(FULL_NAME) ?? [])];
  const mentionsChild = includesAny(text, CHILD_TERMS).length > 0;

  // The core rule: a named individual plus a health disclosure is exactly the
  // combination that identifies someone as a client.
  if (sensitive.length > 0 && names.length > 0 && !input.hasConsentOnFile) {
    issues.push({
      severity: "block",
      field: "body",
      message:
        `This mentions ${sensitive.slice(0, 2).map((t) => `"${t}"`).join(" and ")} alongside ` +
        `what looks like a personal name (${names.slice(0, 2).join(", ")}). Written informed ` +
        `consent must be recorded before publishing, and de-identifying is safer than relying ` +
        `on it.`,
    });
  }

  // A child cannot consent for themselves, and the risk of harm is higher.
  if (sensitive.length > 0 && mentionsChild && names.length > 0) {
    issues.push({
      severity: "block",
      field: "body",
      message:
        "This appears to identify a child in connection with a health or protection issue. " +
        "Do not publish. Use a pseudonym, remove identifying detail, and confirm guardian " +
        "consent with the safeguarding lead first.",
    });
  }

  const phones = text.match(PHONE) ?? [];
  if (phones.length > 0) {
    issues.push({
      severity: "block",
      field: "body",
      message:
        `Contains what looks like a personal phone number (${phones[0]}). Remove it. Only ` +
        `published organisational and helpline numbers belong in public content.`,
    });
  }

  const emails = (text.match(EMAIL) ?? []).filter(
    (e) => !e.endsWith("ujasiricommunitycare.or.ke"),
  );
  if (emails.length > 0) {
    issues.push({
      severity: "warn",
      field: "body",
      message: `Contains a non-UCC email address (${emails[0]}). Confirm it is meant to be public.`,
    });
  }

  if (sensitive.length > 0 && names.length === 0) {
    issues.push({
      severity: "warn",
      field: "body",
      message:
        "This covers a sensitive health or protection topic. Check that no combination of " +
        "details — a village, a role, an age, a family circumstance — makes someone " +
        "identifiable to their own community, even without a name.",
    });
  }

  return issues;
}

/**
 * Check an image before publication. Photography carries the same risk as text
 * and is harder to walk back once it has been shared onward.
 */
export function checkMedia(input: {
  alt: string;
  consentOnFile: boolean;
  collection?: string;
}): SafeguardingIssue[] {
  const issues: SafeguardingIssue[] = [];

  if (!input.alt.trim()) {
    issues.push({
      severity: "warn",
      field: "alt",
      message:
        "No alternative text. A screen-reader user gets nothing from this image — describe it, " +
        "or mark it explicitly decorative.",
    });
  }

  // Anything depicting people needs a consent record, full stop.
  const depictsPeople = includesAny(input.alt, [
    "woman",
    "man",
    "girl",
    "boy",
    "child",
    "client",
    "patient",
    "mother",
    "family",
    "person",
    "people",
    "portrait",
    "face",
    "staff",
    "volunteer",
  ]).length > 0;

  if (depictsPeople && !input.consentOnFile) {
    issues.push({
      severity: "block",
      field: "consent",
      message:
        "This image appears to show people and has no consent recorded. Record written consent " +
        "before publishing, or use a photograph in which nobody is identifiable.",
    });
  }

  if (includesAny(input.alt, ["child", "girl", "boy", "pupil", "learner"]).length > 0) {
    issues.push({
      severity: "warn",
      field: "consent",
      message:
        "This image appears to show a child. Guardian consent is required, and our standing " +
        "advice is to photograph hands, backs or wide scenes instead.",
    });
  }

  return issues;
}

export function hasBlockingIssue(issues: SafeguardingIssue[]): boolean {
  return issues.some((i) => i.severity === "block");
}

/** Short, plain-language summary for an editor. */
export function summarise(issues: SafeguardingIssue[]): string {
  if (issues.length === 0) return "No safeguarding concerns detected.";
  const blocking = issues.filter((i) => i.severity === "block").length;
  const warnings = issues.length - blocking;

  const parts: string[] = [];
  if (blocking) parts.push(`${blocking} blocking issue${blocking === 1 ? "" : "s"}`);
  if (warnings) parts.push(`${warnings} warning${warnings === 1 ? "" : "s"}`);
  return parts.join(", ");
}

/**
 * These checks are a safety net, not a substitute for judgement. They cannot
 * detect that a village name plus an age identifies exactly one person, and
 * they never will. Staff training is the actual control; this catches the
 * obvious mistakes made at speed.
 */
export const SAFEGUARDING_NOTE =
  "Automated checks catch obvious problems only. If you are unsure whether something " +
  "identifies a client, it probably does — ask the safeguarding lead before publishing.";
