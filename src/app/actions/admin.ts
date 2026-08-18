"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canAssignRole, getCurrentUser, requirePermission } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import { setRoleClaim, setUserDisabled } from "@/lib/firebase/admin";
import { requireAdminClient } from "@/lib/supabase/server";
import { checkContent, hasBlockingIssue } from "@/lib/safeguarding";
import type { FormState } from "@/lib/form-state";

/**
 * Admin writes.
 *
 * Every action here follows the same four steps, in this order:
 *
 *   1. requirePermission — throws to the 401/403 boundary before anything else.
 *   2. Validate the input, including the allowed set of status values. Never
 *      trust a value just because it arrived from our own <select>.
 *   3. Perform the write.
 *   4. Record an audit entry, then revalidate the affected path.
 *
 * The permission check happens on the server every time. Hiding a button in the
 * UI is a courtesy; it is not a control, and these actions are callable
 * directly by anyone who knows the endpoint.
 */

function fail(message: string): FormState {
  return { ok: false, message };
}

function ok(message: string): FormState {
  return { ok: true, message };
}

/** Shared shape: an id and a status drawn from a fixed set. */
function statusSchema<T extends readonly [string, ...string[]]>(values: T) {
  return z.object({
    id: z.coerce.number().int().positive(),
    status: z.enum(values),
    notes: z.string().trim().max(2000).optional(),
  });
}

// --- Supporter operations ---------------------------------------------------

const donationStatuses = ["pending", "completed", "failed", "refunded"] as const;

export async function updateDonationStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("donations:manage");

  const parsed = statusSchema(donationStatuses).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return fail("That status is not valid.");

  const db = requireAdminClient("Updating a donation");
  const { error } = await db
    .from("donations")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not update the donation. Please try again.");

  await recordAudit({
    actor,
    action: "donation.status_changed",
    entity: "donation",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/donations");
  return ok(`Donation marked ${parsed.data.status}.`);
}

const volunteerStatuses = ["new", "reviewing", "accepted", "declined"] as const;

export async function updateVolunteerStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("volunteers:manage");

  const parsed = statusSchema(volunteerStatuses).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return fail("That status is not valid.");

  const db = requireAdminClient("Updating an application");
  const { error } = await db
    .from("volunteer_applications")
    .update({
      status: parsed.data.status,
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not update the application. Please try again.");

  await recordAudit({
    actor,
    action: "volunteer.status_changed",
    entity: "volunteer_application",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/volunteers");
  return ok(`Application marked ${parsed.data.status}.`);
}

const messageStatuses = ["new", "in_progress", "resolved"] as const;

export async function updateMessageStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("messages:manage");

  const parsed = statusSchema(messageStatuses).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return fail("That status is not valid.");

  const db = requireAdminClient("Updating an enquiry");
  const { error } = await db
    .from("contact_messages")
    .update({ status: parsed.data.status, handled_by: actor.id })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not update the enquiry. Please try again.");

  await recordAudit({
    actor,
    action: "message.status_changed",
    entity: "contact_message",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/messages");
  return ok(`Enquiry marked ${parsed.data.status.replace(/_/g, " ")}.`);
}

// --- Recruitment ------------------------------------------------------------

const applicationStatuses = [
  "received",
  "shortlisted",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
] as const;

export async function updateApplicationStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("applications:manage");

  const parsed = statusSchema(applicationStatuses).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return fail("That status is not valid.");

  const db = requireAdminClient("Updating an application");
  const { error } = await db
    .from("job_applications")
    .update({
      status: parsed.data.status,
      reviewed_by: actor.id,
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not update the application. Please try again.");

  await recordAudit({
    actor,
    action: "job_application.status_changed",
    entity: "job_application",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/applications");
  return ok(`Candidate marked ${parsed.data.status}.`);
}

const jobStatuses = ["draft", "open", "closed", "filled"] as const;

export async function updateJobStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("jobs:manage");

  const parsed = statusSchema(jobStatuses).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return fail("That status is not valid.");

  const db = requireAdminClient("Updating a vacancy");

  // Opening a vacancy stamps its publication time, which is what the public
  // listing and the sitemap order by.
  const patch: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "open") patch.published_at = new Date().toISOString();

  const { error } = await db.from("job_openings").update(patch).eq("id", parsed.data.id);
  if (error) return fail("Could not update the vacancy. Please try again.");

  await recordAudit({
    actor,
    action: "job.status_changed",
    entity: "job_opening",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  return ok(`Vacancy marked ${parsed.data.status}.`);
}

// --- HR ---------------------------------------------------------------------

const hrStatuses = ["open", "in_progress", "resolved", "declined"] as const;

export async function updateHrRequestAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("hr:manage");

  const parsed = z
    .object({
      id: z.coerce.number().int().positive(),
      status: z.enum(hrStatuses),
      response: z.string().trim().max(4000).optional(),
    })
    .safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
      response: formData.get("response") ?? undefined,
    });

  if (!parsed.success) return fail("That status is not valid.");

  const db = requireAdminClient("Updating an HR request");
  const { error } = await db
    .from("hr_requests")
    .update({
      status: parsed.data.status,
      handled_by: actor.id,
      ...(parsed.data.response !== undefined ? { response: parsed.data.response } : {}),
    })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not update the request. Please try again.");

  // The detail deliberately records only the status. An HR request may concern
  // a grievance, and the audit log is readable by a wider group than the
  // request itself — so its contents must never leak into the log.
  await recordAudit({
    actor,
    action: "hr_request.status_changed",
    entity: "hr_request",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/hr");
  return ok(`Request marked ${parsed.data.status.replace(/_/g, " ")}.`);
}

// --- People -----------------------------------------------------------------

export async function assignRoleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("users:assign_roles");

  const parsed = z
    .object({
      userId: z.string().min(6),
      roleId: z.coerce.number().int().positive(),
    })
    .safeParse({ userId: formData.get("userId"), roleId: formData.get("roleId") });

  if (!parsed.success) return fail("That role is not valid.");

  const db = requireAdminClient("Changing a role");

  const { data: role } = await db
    .from("roles")
    .select("id, name, label, rank")
    .eq("id", parsed.data.roleId)
    .maybeSingle();

  if (!role) return fail("That role no longer exists.");

  // The escalation guard: you may never grant a role at or above your own rank.
  // Without this, anyone holding users:assign_roles could make themselves a
  // Super Admin, which would render the whole permission model decorative.
  if (!canAssignRole(actor, role.rank as number)) {
    return fail("You cannot assign a role at or above your own.");
  }

  const { data: target } = await db
    .from("profiles")
    .select("id, email, roles!inner(name, rank)")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (!target) return fail("That account no longer exists.");

  const targetRank = (target.roles as unknown as { rank: number }).rank;

  // You also cannot demote or alter someone who outranks you.
  if (targetRank >= (actor.role_rank ?? 0) && target.id !== actor.id) {
    return fail("You cannot change the role of someone at or above your own rank.");
  }

  // Removing the last Super Admin would lock the organisation out of its own
  // system permanently, with no recovery path short of direct database access.
  const currentName = (target.roles as unknown as { name: string }).name;
  if (currentName === "SUPER_ADMIN" && role.name !== "SUPER_ADMIN") {
    const { count } = await db
      .from("profiles")
      .select("id, roles!inner(name)", { count: "exact", head: true })
      .eq("roles.name", "SUPER_ADMIN")
      .eq("is_active", true);

    if ((count ?? 0) <= 1) {
      return fail(
        "This is the only Super Admin. Promote someone else first, or the organisation would lose all administrative access.",
      );
    }
  }

  const { error } = await db
    .from("profiles")
    .update({ role_id: parsed.data.roleId })
    .eq("id", parsed.data.userId);

  if (error) return fail("Could not change the role. Please try again.");

  // Keep the Firebase claim in step with the database. The database remains
  // the authority; the claim is only a hint for the proxy's cheap redirect.
  await setRoleClaim(parsed.data.userId, role.name as string).catch(() => {});

  await recordAudit({
    actor,
    action: "user.role_changed",
    entity: "profile",
    entityId: parsed.data.userId,
    detail: { from: currentName, to: role.name, email: target.email },
  });

  revalidatePath("/admin/users");
  return ok(`Role changed to ${role.label}.`);
}

export async function setUserActiveAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("users:edit");

  const parsed = z
    .object({
      userId: z.string().min(6),
      active: z.enum(["true", "false"]).transform((v) => v === "true"),
    })
    .safeParse({ userId: formData.get("userId"), active: formData.get("active") });

  if (!parsed.success) return fail("That request is not valid.");

  // Deactivating yourself would immediately sign you out with no way back in.
  if (parsed.data.userId === actor.id) {
    return fail("You cannot deactivate your own account.");
  }

  const db = requireAdminClient("Changing an account");

  const { data: target } = await db
    .from("profiles")
    .select("id, email, roles!inner(rank)")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (!target) return fail("That account no longer exists.");

  if ((target.roles as unknown as { rank: number }).rank >= (actor.role_rank ?? 0)) {
    return fail("You cannot change an account at or above your own rank.");
  }

  const { error } = await db
    .from("profiles")
    .update({ is_active: parsed.data.active })
    .eq("id", parsed.data.userId);

  if (error) return fail("Could not update the account. Please try again.");

  // Disable in Firebase as well, so existing sessions die on the next request
  // rather than surviving until the session cookie expires.
  await setUserDisabled(parsed.data.userId, !parsed.data.active).catch(() => {});

  await recordAudit({
    actor,
    action: parsed.data.active ? "user.activated" : "user.deactivated",
    entity: "profile",
    entityId: parsed.data.userId,
    detail: { email: target.email },
  });

  revalidatePath("/admin/users");
  return ok(parsed.data.active ? "Account reactivated." : "Account deactivated.");
}

// --- Content ----------------------------------------------------------------

const postStatuses = ["draft", "published", "archived"] as const;

export async function updatePostStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.");

  const parsed = statusSchema(postStatuses).safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return fail("That status is not valid.");

  // Publishing is a separate permission from editing: an Author may write and
  // revise their own work but must not be able to put it in front of the public.
  const needed = parsed.data.status === "published" ? "content:publish" : "content:edit";
  if (!user.permissions.includes(needed) && !user.permissions.includes("content:edit_own")) {
    return fail("You do not have permission to change this.");
  }

  const db = requireAdminClient("Updating content");

  // An Author holding only content:edit_own may act on their own posts alone.
  const scoped =
    user.permissions.includes("content:edit_own") && !user.permissions.includes("content:edit");

  if (scoped && parsed.data.status === "published") {
    return fail("Authors cannot publish. Ask an editor to review this.");
  }

  // Safeguarding gate. Only publication is checked: a draft may legitimately
  // contain notes an editor is still working through, but nothing reaches the
  // public without passing this.
  if (parsed.data.status === "published") {
    const { data: post } = await db
      .from("posts")
      .select("title, excerpt, body")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (post) {
      const issues = checkContent({
        title: post.title as string,
        excerpt: (post.excerpt as string) ?? "",
        body: (post.body as string) ?? "",
      });

      if (hasBlockingIssue(issues)) {
        const blocking = issues.filter((i) => i.severity === "block");

        await recordAudit({
          actor: user,
          action: "post.publish_blocked",
          entity: "post",
          entityId: parsed.data.id,
          detail: { reasons: blocking.map((i) => i.message) },
        });

        return fail(
          `Publication blocked by safeguarding: ${blocking[0].message} ` +
            `Resolve this, or speak to the safeguarding lead.`,
        );
      }
    }
  }

  let q = db
    .from("posts")
    .update({
      status: parsed.data.status,
      ...(parsed.data.status === "published"
        ? { published_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", parsed.data.id);

  if (scoped) q = q.eq("author_id", user.id);

  const { error } = await q;
  if (error) return fail("Could not update the post. Please try again.");

  await recordAudit({
    actor: user,
    action: "post.status_changed",
    entity: "post",
    entityId: parsed.data.id,
    detail: { status: parsed.data.status },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/news");
  return ok(`Post marked ${parsed.data.status}.`);
}

/**
 * Record a programme's reach figure.
 *
 * Deliberately the only way this number can be set. It is a published impact
 * claim, so it needs a permission check, an audit trail showing who changed it
 * and from what, and a single place to correct it — none of which a value
 * typed into a source file gives you.
 */
export async function updateProgramReachAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("content:edit");

  const parsed = z
    .object({
      id: z.coerce.number().int().positive(),
      peopleReached: z.coerce
        .number()
        .int("Enter a whole number.")
        .min(0, "A reach figure cannot be negative.")
        .max(100_000_000, "That figure looks wrong — please check it."),
    })
    .safeParse({
      id: formData.get("id"),
      peopleReached: formData.get("peopleReached"),
    });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "That figure is not valid.");
  }

  const db = requireAdminClient("Updating a programme");

  const { data: before } = await db
    .from("programs")
    .select("slug, people_reached")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const { error } = await db
    .from("programs")
    .update({ people_reached: parsed.data.peopleReached })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not save the figure. Please try again.");

  await recordAudit({
    actor,
    action: "program.reach_updated",
    entity: "program",
    entityId: parsed.data.id,
    detail: {
      slug: before?.slug,
      from: before?.people_reached ?? null,
      to: parsed.data.peopleReached,
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  revalidatePath("/impact");
  revalidatePath("/");

  return ok(
    parsed.data.peopleReached === 0
      ? "Figure cleared — nothing will be published for this programme."
      : `Reach set to ${parsed.data.peopleReached.toLocaleString("en-KE")}.`,
  );
}

/**
 * Update a project's publishable details.
 *
 * Every field here appears on the public site. Blank is always valid and means
 * "not recorded" — the site omits it rather than substituting a placeholder,
 * which is the difference between an incomplete record and a false claim.
 */
export async function updateProjectDetailsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("content:edit");

  const parsed = z
    .object({
      id: z.coerce.number().int().positive(),
      funder: z.string().trim().max(160),
      funderUrl: z
        .string()
        .trim()
        .url("The funder website must be a full link starting with https://")
        .or(z.literal(""))
        .optional(),
      target: z.string().trim().max(300),
      reportingLine: z.string().trim().max(200),
      beneficiaries: z.coerce.number().int().min(0).max(100_000_000),
      coverImage: z.string().trim().max(500),
    })
    .safeParse({
      id: formData.get("id"),
      funder: formData.get("funder") ?? "",
      funderUrl: formData.get("funderUrl") ?? "",
      target: formData.get("target") ?? "",
      reportingLine: formData.get("reportingLine") ?? "",
      beneficiaries: formData.get("beneficiaries") || 0,
      coverImage: formData.get("coverImage") ?? "",
    });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check the fields.");
  }

  const db = requireAdminClient("Updating a project");

  const { data: before } = await db
    .from("projects")
    .select("slug, funder, target, beneficiaries")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const { error } = await db
    .from("projects")
    .update({
      funder: parsed.data.funder,
      funder_url: parsed.data.funderUrl || null,
      target: parsed.data.target,
      reporting_line: parsed.data.reportingLine,
      beneficiaries: parsed.data.beneficiaries,
      cover_image: parsed.data.coverImage || null,
    })
    .eq("id", parsed.data.id);

  if (error) return fail("Could not save the project. Please try again.");

  await recordAudit({
    actor,
    action: "project.details_updated",
    entity: "project",
    entityId: parsed.data.id,
    detail: {
      slug: before?.slug,
      funder: { from: before?.funder ?? "", to: parsed.data.funder },
      target: { from: before?.target ?? "", to: parsed.data.target },
      beneficiaries: { from: before?.beneficiaries ?? 0, to: parsed.data.beneficiaries },
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");

  return ok("Project details saved and published.");
}

/**
 * Update the organisation's public details.
 *
 * These appear in the header, the footer, every contact route, the structured
 * data and the sitemap. Changing one here changes it everywhere at once, which
 * is the entire point — a phone number that lives in six components is a phone
 * number that will eventually be wrong in three of them.
 *
 * Stored as a single JSON record, deep-merged over the compiled defaults on
 * read, so a partial save never blanks a field it did not mention.
 */
export async function updateOrgSettingsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("settings:manage");

  const phoneList = z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(/[\n,]/)
        .map((n) => n.trim())
        .filter(Boolean),
    );

  const parsed = z
    .object({
      name: z.string().trim().min(2).max(120),
      shortName: z.string().trim().min(1).max(20),
      legalName: z.string().trim().min(2).max(160),
      tagline: z.string().trim().max(160),
      mission: z.string().trim().max(600),
      description: z.string().trim().max(600),
      founded: z.string().trim().regex(/^\d{4}$/, "Enter a four-digit year."),

      regLabel: z.string().trim().max(80),
      regNumber: z.string().trim().max(80),
      regAuthority: z.string().trim().max(160),
      taxLabel: z.string().trim().max(80),
      taxNumber: z.string().trim().max(80),

      email: z.string().trim().toLowerCase().email(),
      supportEmail: z.string().trim().toLowerCase().email(),
      safeguardingEmail: z.string().trim().toLowerCase().email(),
      street: z.string().trim().max(160),
      locality: z.string().trim().max(80),
      region: z.string().trim().max(80),
      postalCode: z.string().trim().max(20),
      countryName: z.string().trim().max(80),
      hours: z.string().trim().max(160),

      careLines: phoneList,
      careHours: z.string().trim().max(160),

      urgentNote: z.string().trim().max(600),
      hotlineLabels: z.string().trim(),
      hotlineNumbers: z.string().trim(),
      hotlineNotes: z.string().trim(),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`${String(issue?.path[0] ?? "A field")}: ${issue?.message ?? "is not valid."}`);
  }

  const d = parsed.data;

  // The three hotline columns are entered as parallel line-separated lists.
  const labels = d.hotlineLabels.split("\n").map((v) => v.trim());
  const numbers = d.hotlineNumbers.split("\n").map((v) => v.trim());
  const notes = d.hotlineNotes.split("\n").map((v) => v.trim());

  const lines = numbers
    .map((number, i) => ({
      label: labels[i] ?? "UCC hotline",
      number,
      note: notes[i] ?? "",
    }))
    .filter((l) => l.number !== "");

  if (lines.length === 0) {
    return fail(
      "At least one hotline number is required. This site covers HIV and gender-based violence — a page with no number to call is not something we ship.",
    );
  }

  const value = {
    name: d.name,
    shortName: d.shortName,
    legalName: d.legalName,
    tagline: d.tagline,
    mission: d.mission,
    description: d.description,
    founded: d.founded,
    registration: {
      label: d.regLabel,
      number: d.regNumber,
      authority: d.regAuthority,
      taxLabel: d.taxLabel,
      taxNumber: d.taxNumber,
    },
    contact: {
      email: d.email,
      supportEmail: d.supportEmail,
      safeguardingEmail: d.safeguardingEmail,
      phone: d.careLines[0] ?? "",
      address: {
        street: d.street,
        locality: d.locality,
        region: d.region,
        postalCode: d.postalCode,
        countryName: d.countryName,
      },
      hours: d.hours,
    },
    help: { urgentNote: d.urgentNote, lines },
    customerCare: { lines: d.careLines, hours: d.careHours },
  };

  const db = requireAdminClient("Updating settings");

  const { error } = await db
    .from("settings")
    .upsert({ key: "organisation", value, updated_at: new Date().toISOString() },
      { onConflict: "key" });

  if (error) return fail("Could not save the settings. Please try again.");

  await recordAudit({
    actor,
    action: "settings.updated",
    entity: "settings",
    entityId: "organisation",
    detail: { name: d.name, hotlines: lines.length },
  });

  // Organisation details appear on every page, so the whole site revalidates.
  revalidatePath("/", "layout");

  return ok("Settings saved. They are live across the site.");
}
