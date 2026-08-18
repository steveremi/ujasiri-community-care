/**
 * Payment providers.
 *
 * The site records the *intent* to give in our own database first, then hands
 * off to a provider. That ordering matters: if Safaricom times out or a card is
 * declined, we still know someone tried, which is the difference between a
 * fixable drop-off and an invisible one.
 *
 * Each provider below is a description, not an integration. `initiate` is
 * implemented per provider in src/lib/payments/adapters/ once you hold the
 * merchant credentials — the UI, validation and record-keeping do not change
 * when you add them.
 */

export type ProviderId = "mpesa" | "airtel" | "stripe" | "paypal";

/** Maps to the `method` column on the donations table. */
export type PaymentMethod = "mpesa" | "card" | "bank" | "cash";

export interface PaymentProvider {
  id: ProviderId;
  name: string;
  /** What the donor sees under the logo. */
  blurb: string;
  method: PaymentMethod;
  currencies: string[];
  /** Local rails settle in KES only; card and PayPal take international gifts. */
  international: boolean;
  supportsRecurring: boolean;
  /** Shown so a donor can see the cost of their chosen route before choosing. */
  feeNote: string;
  /** Env vars that must be present before this option goes live. */
  requiredEnv: string[];
}

export const PROVIDERS: PaymentProvider[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    blurb: "Pay by STK push to your phone",
    method: "mpesa",
    currencies: ["KES"],
    international: false,
    supportsRecurring: false,
    feeNote: "No fee to you. Safaricom charges UCC a small transaction fee.",
    requiredEnv: [
      "MPESA_CONSUMER_KEY",
      "MPESA_CONSUMER_SECRET",
      "MPESA_SHORTCODE",
      "MPESA_PASSKEY",
    ],
  },
  {
    id: "airtel",
    name: "Airtel Money",
    blurb: "Approve the prompt on your phone",
    method: "mpesa",
    currencies: ["KES"],
    international: false,
    supportsRecurring: false,
    feeNote: "No fee to you.",
    requiredEnv: ["AIRTEL_CLIENT_ID", "AIRTEL_CLIENT_SECRET"],
  },
  {
    id: "stripe",
    name: "Card & bank",
    blurb: "Visa, Mastercard and bank transfer",
    method: "card",
    currencies: ["KES", "USD", "GBP", "EUR"],
    international: true,
    supportsRecurring: true,
    feeNote: "Stripe deducts a processing fee of roughly 2.9% + 30¢.",
    requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  },
  {
    id: "paypal",
    name: "PayPal",
    blurb: "Give with your PayPal balance or card",
    method: "card",
    currencies: ["USD", "GBP", "EUR"],
    international: true,
    supportsRecurring: true,
    feeNote: "PayPal deducts a processing fee of roughly 3.5%.",
    requiredEnv: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
  },
];

export function getProvider(id: string): PaymentProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/** A provider is live once every credential it needs is present. */
export function isProviderLive(provider: PaymentProvider): boolean {
  return provider.requiredEnv.every((key) => Boolean(process.env[key]?.trim()));
}

/**
 * Suggested amounts, each tied to something concrete the money buys.
 *
 * Donors give more when an amount means something. Every figure here must be
 * defensible from your actual unit costs — an invented one is a claim you
 * cannot support, and this is a sector where that gets noticed.
 */
export const GIVING_TIERS = [
  {
    amount: 500,
    label: "KES 500",
    impact: "Two HIV self-test kits, delivered with a follow-up call",
  },
  {
    amount: 1500,
    label: "KES 1,500",
    impact: "TB screening and sputum transport for six people",
  },
  {
    amount: 2000,
    label: "KES 2,000",
    impact: "A reusable pad kit and health session for four girls",
  },
  {
    amount: 5000,
    label: "KES 5,000",
    impact: "Transport and navigation for one woman through cancer treatment",
  },
  {
    amount: 10000,
    label: "KES 10,000",
    impact: "A full community testing day reaching around 80 people",
  },
] as const;

export const MONTHLY_TIERS = [
  { amount: 500, label: "KES 500", impact: "Follow-up calls keeping four clients in HIV care" },
  { amount: 1000, label: "KES 1,000", impact: "A girl's safe-space place for a full term" },
  { amount: 2500, label: "KES 2,500", impact: "One TB client supported through six months of treatment" },
  { amount: 5000, label: "KES 5,000", impact: "A community health promoter's monthly stipend" },
] as const;

export const MIN_DONATION_KES = 50;
export const MAX_DONATION_KES = 5_000_000;
