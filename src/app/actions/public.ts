"use server";

import { z } from "zod";

import { adminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { FormState } from "@/lib/form-state";

/**
 * Public form submissions.
 *
 * These are the only writes an unauthenticated visitor can make. Each one
 * validates on the server (never trusting client validation), writes through
 * the service-role client, and returns a plain object for useActionState.
 *
 * Note what is deliberately NOT collected: no health status, no HIV result,
 * no account of an incident of violence. A visitor with something sensitive to
 * tell us is directed to a phone number or an in-person service, because a web
 * form is the wrong place for it and storing it here would create a record
 * that could put someone in danger.
 */

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Shared guard so every action fails the same, helpful way before keys exist. */
function notConfigured(thing: string): FormState {
  return {
    ok: false,
    message: `${thing} cannot be saved yet — the site is running in demo mode without a database. Add your Supabase keys to .env.local to go live.`,
  };
}

// --- Newsletter -------------------------------------------------------------

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  name: z.string().trim().max(120).optional(),
  source: z.string().trim().max(40).default("footer"),
});

export async function subscribeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") ?? undefined,
    source: formData.get("source") ?? "footer",
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the form.", errors: fieldErrors(parsed.error) };
  }

  const db = adminClient();
  if (!db) return notConfigured("Your subscription");

  const { error } = await db
    .from("subscribers")
    .upsert(
      { email: parsed.data.email, name: parsed.data.name ?? "", source: parsed.data.source },
      { onConflict: "email" },
    );

  if (error) return { ok: false, message: "Something went wrong. Please try again." };

  return { ok: true, message: "You're subscribed. Look out for our next monthly update." };
}

// --- Contact ----------------------------------------------------------------

const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  subject: z.string().trim().max(200).optional(),
  topic: z.string().trim().max(40).default("general"),
  message: z
    .string()
    .trim()
    .min(10, "Please give us a little more detail.")
    .max(4000, "Please keep this under 4,000 characters."),
});

export async function contactAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") ?? undefined,
    topic: formData.get("topic") ?? "general",
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the form.", errors: fieldErrors(parsed.error) };
  }

  const db = adminClient();
  if (!db) return notConfigured("Your message");

  const { error } = await db.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject ?? "",
    topic: parsed.data.topic,
    message: parsed.data.message,
  });

  if (error) return { ok: false, message: "Something went wrong. Please try again." };

  return {
    ok: true,
    message:
      "Thank you — we've received your message and will reply within two working days. If your matter is urgent, please call us instead.",
  };
}

// --- Volunteer --------------------------------------------------------------

const volunteerSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional(),
  skills: z.string().trim().max(600).optional(),
  availability: z.string().trim().max(200).optional(),
  motivation: z
    .string()
    .trim()
    .min(20, "Tell us a little about why you'd like to volunteer.")
    .max(2000),
  programId: z.coerce.number().int().positive().optional(),
});

export async function volunteerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawProgram = formData.get("programId");
  const parsed = volunteerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
    skills: formData.get("skills") ?? undefined,
    availability: formData.get("availability") ?? undefined,
    motivation: formData.get("motivation"),
    programId: rawProgram && rawProgram !== "" ? rawProgram : undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the form.", errors: fieldErrors(parsed.error) };
  }

  const db = adminClient();
  if (!db) return notConfigured("Your application");

  const { error } = await db.from("volunteer_applications").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? "",
    skills: parsed.data.skills ?? "",
    availability: parsed.data.availability ?? "",
    motivation: parsed.data.motivation,
    program_id: parsed.data.programId ?? null,
  });

  if (error) return { ok: false, message: "Something went wrong. Please try again." };

  return {
    ok: true,
    message:
      "Application received. Our volunteer coordinator will be in touch within five working days. All volunteer roles require a background check and safeguarding induction.",
  };
}

export async function isLive(): Promise<boolean> {
  return isSupabaseConfigured;
}
