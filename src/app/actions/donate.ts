"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { adminClient } from "@/lib/supabase/server";
import {
  MAX_DONATION_KES,
  MIN_DONATION_KES,
  getProvider,
  isProviderLive,
} from "@/lib/payments/providers";
import type { DonateState } from "@/lib/form-state";

/**
 * Recording a gift.
 *
 * The order of operations is deliberate:
 *   1. Validate on the server.
 *   2. Write a `pending` donation row and mint a reference.
 *   3. Hand off to the provider.
 *   4. The provider's webhook flips the row to `completed` (or `failed`).
 *
 * Writing the row *before* the handoff means an abandoned or failed payment is
 * still visible to the finance team. A donation that only appears on success
 * makes drop-off invisible, and drop-off is the thing worth fixing.
 */

const donateSchema = z
  .object({
    amount: z.coerce
      .number()
      .int("Enter a whole amount.")
      .min(MIN_DONATION_KES, `The minimum gift is KES ${MIN_DONATION_KES}.`)
      .max(MAX_DONATION_KES, "Please contact us directly for a gift of this size."),
    frequency: z.enum(["one_off", "monthly"]),
    provider: z.enum(["mpesa", "airtel", "stripe", "paypal"]),
    name: z.string().trim().max(120).optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address so we can send your receipt."),
    phone: z.string().trim().max(20).optional(),
    projectId: z.coerce.number().int().positive().optional(),
    isAnonymous: z.boolean().default(false),
    message: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // Mobile money needs a number to push the payment prompt to.
    if ((data.provider === "mpesa" || data.provider === "airtel") && !data.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "We need your phone number to send the payment request.",
      });
    }
    if (data.phone && !/^(?:\+?254|0)?7\d{8}$/.test(data.phone.replace(/[\s-]/g, ""))) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid Kenyan mobile number, e.g. 0712 345 678.",
      });
    }
    if (data.frequency === "monthly") {
      const provider = getProvider(data.provider);
      if (provider && !provider.supportsRecurring) {
        ctx.addIssue({
          code: "custom",
          path: ["provider"],
          message: `${provider.name} cannot take monthly gifts yet. Choose card or PayPal for a monthly gift.`,
        });
      }
    }
  });

export async function donateAction(
  _prev: DonateState,
  formData: FormData,
): Promise<DonateState> {
  const parsed = donateSchema.safeParse({
    amount: formData.get("amount"),
    frequency: formData.get("frequency") ?? "one_off",
    provider: formData.get("provider") ?? "mpesa",
    name: formData.get("name") ?? undefined,
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
    projectId: formData.get("projectId") || undefined,
    isAnonymous: formData.get("isAnonymous") === "on",
    message: formData.get("message") ?? undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }

  const data = parsed.data;
  const provider = getProvider(data.provider)!;
  const reference = `UCC-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  const db = adminClient();
  if (!db) {
    return {
      ok: false,
      message:
        "Donations cannot be processed yet — the site is running in demo mode. Add your Supabase keys and payment credentials to go live.",
    };
  }

  const { error } = await db.from("donations").insert({
    reference,
    donor_name: data.isAnonymous ? "" : (data.name ?? ""),
    donor_email: data.email,
    project_id: data.projectId ?? null,
    amount_cents: data.amount * 100,
    currency: "KES",
    frequency: data.frequency,
    method: provider.method,
    status: "pending",
    is_anonymous: data.isAnonymous,
    message: data.message ?? "",
  });

  if (error) {
    return { ok: false, message: "We could not start your donation. Please try again." };
  }

  // Provider handoff. Each adapter lands here once its credentials exist; until
  // then the gift is recorded and the donor is told exactly what happened
  // rather than being dropped on a dead end.
  if (!isProviderLive(provider)) {
    return {
      ok: true,
      reference,
      message:
        `Your gift of KES ${data.amount.toLocaleString("en-KE")} has been recorded under reference ${reference}. ` +
        `${provider.name} is not yet connected on this site, so no money has been taken — ` +
        `our team will contact you at ${data.email} to complete it.`,
    };
  }

  // TODO(payments): call the adapter for `provider.id` and return its
  // checkout URL (Stripe / PayPal) or await the STK push (M-Pesa / Airtel).
  return {
    ok: true,
    reference,
    message: `Thank you. Follow the prompt from ${provider.name} to complete your gift.`,
  };
}
