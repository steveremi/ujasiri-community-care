"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/dal";
import { adminClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";

/**
 * Job applications and HR requests.
 *
 * Both handle personal data about identifiable people, so both validate on the
 * server and neither is ever exposed through a public read path.
 */

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

// --- Applying for a job -----------------------------------------------------

const applicationSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "We need a phone number to contact you.").max(20),
  yearsExperience: z.coerce.number().int().min(0).max(60).default(0),
  coverLetter: z
    .string()
    .trim()
    .min(80, "Tell us a little more — at least a short paragraph.")
    .max(6000, "Please keep this under 6,000 characters."),
  cvUrl: z
    .string()
    .trim()
    .url("Enter a full link, starting with https://")
    .optional()
    .or(z.literal("")),
  // Not a formality: everyone working with our clients is checked and trained,
  // and we have to be able to evidence that applicants were told so up front.
  safeguardingAck: z.literal(true, {
    message: "You must confirm you have read the safeguarding requirements.",
  }),
});

export async function applyForJobAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    yearsExperience: formData.get("yearsExperience") || 0,
    coverLetter: formData.get("coverLetter"),
    cvUrl: formData.get("cvUrl") ?? "",
    safeguardingAck: formData.get("safeguardingAck") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const db = adminClient();
  if (!db) {
    return {
      ok: false,
      message:
        "Applications cannot be submitted yet — this site is not connected to its database. Please email us instead.",
    };
  }

  const user = await getCurrentUser();
  const reference = `UCC-JOB-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Re-applying updates the existing row rather than creating a duplicate the
  // panel then has to reconcile.
  const { error } = await db.from("job_applications").upsert(
    {
      reference,
      job_id: parsed.data.jobId,
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      cover_letter: parsed.data.coverLetter,
      cv_url: parsed.data.cvUrl || null,
      years_experience: parsed.data.yearsExperience,
      safeguarding_ack: true,
      status: "received",
    },
    { onConflict: "job_id,email" },
  );

  if (error) {
    return { ok: false, message: "We could not submit your application. Please try again." };
  }

  return {
    ok: true,
    message:
      `Application received under reference ${reference}. We read every application and will be in touch after the closing date, ` +
      `whether or not you are shortlisted.`,
  };
}

// --- HR requests ------------------------------------------------------------

const hrSchema = z.object({
  category: z.enum([
    "leave",
    "grievance",
    "reference",
    "policy",
    "payroll",
    "equipment",
    "general",
  ]),
  subject: z.string().trim().min(4, "Give your request a short subject.").max(200),
  details: z
    .string()
    .trim()
    .min(20, "Please give us enough detail to act on.")
    .max(5000),
  confidential: z.boolean().default(false),
});

export async function submitHrRequestAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // HR requests are for staff. An unauthenticated visitor has no business
  // raising one, and the RLS policy keys on the signed-in user anyway.
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Please sign in to raise an HR request." };
  }

  const parsed = hrSchema.safeParse({
    category: formData.get("category") ?? "general",
    subject: formData.get("subject"),
    details: formData.get("details"),
    // A grievance is confidential by default: routing it past the requester's
    // own line manager is the entire point of having the flag.
    confidential:
      formData.get("confidential") === "on" || formData.get("category") === "grievance",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const db = adminClient();
  if (!db) {
    return { ok: false, message: "HR requests are not available yet — the database is not connected." };
  }

  const reference = `UCC-HR-${randomUUID().slice(0, 8).toUpperCase()}`;

  const { error } = await db.from("hr_requests").insert({
    reference,
    user_id: user.id,
    requester_name: user.name,
    requester_email: user.email,
    category: parsed.data.category,
    subject: parsed.data.subject,
    details: parsed.data.details,
    confidential: parsed.data.confidential,
    status: "open",
  });

  if (error) {
    return { ok: false, message: "We could not submit your request. Please try again." };
  }

  return {
    ok: true,
    message: parsed.data.confidential
      ? `Request ${reference} submitted confidentially. It goes only to staff with full HR rights — not to your line manager.`
      : `Request ${reference} submitted. HR will respond within five working days.`,
  };
}
