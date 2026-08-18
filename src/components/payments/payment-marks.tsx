import type { SVGProps } from "react";

/**
 * Payment provider marks.
 *
 * These are clean, self-drawn approximations in each provider's brand colour —
 * enough for a donor to recognise the option at a glance, and they work offline
 * with no external requests (the Content Security Policy blocks those anyway).
 *
 * BEFORE LAUNCH: replace each with the official asset from the provider's own
 * brand kit. Every one of these companies publishes approved logo files and
 * requires you to use them:
 *   M-Pesa   — Safaricom brand centre
 *   Airtel   — Airtel Africa brand guidelines
 *   Stripe   — stripe.com/newsroom/brand-assets (plus Visa/Mastercard marks)
 *   PayPal   — paypal.com/brand-centre
 * Displaying them is permitted as nominative use because you genuinely accept
 * these methods; altering the official marks is not, so swap rather than edit.
 */

type MarkProps = SVGProps<SVGSVGElement> & { title?: string };

export function MpesaMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 96 28" role="img" aria-label="M-Pesa" className={className} {...props}>
      <rect width="96" height="28" rx="5" fill="#00A64F" />
      <text
        x="48"
        y="19"
        textAnchor="middle"
        fill="#fff"
        fontFamily="system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="-0.3"
      >
        M-PESA
      </text>
    </svg>
  );
}

export function AirtelMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 96 28" role="img" aria-label="Airtel Money" className={className} {...props}>
      <rect width="96" height="28" rx="5" fill="#E40000" />
      <text
        x="48"
        y="18.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="system-ui, sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="-0.2"
      >
        airtel money
      </text>
    </svg>
  );
}

export function VisaMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 96 28" role="img" aria-label="Visa" className={className} {...props}>
      <rect width="96" height="28" rx="5" fill="#fff" stroke="#E2E8F0" />
      <text
        x="48"
        y="19.5"
        textAnchor="middle"
        fill="#1A1F71"
        fontFamily="system-ui, sans-serif"
        fontSize="15"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 96 28" role="img" aria-label="Mastercard" className={className} {...props}>
      <rect width="96" height="28" rx="5" fill="#fff" stroke="#E2E8F0" />
      <circle cx="41" cy="14" r="8.5" fill="#EB001B" />
      <circle cx="55" cy="14" r="8.5" fill="#F79E1B" />
      <path
        d="M48 7.6a8.48 8.48 0 0 0 0 12.8 8.48 8.48 0 0 0 0-12.8Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function PaypalMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 96 28" role="img" aria-label="PayPal" className={className} {...props}>
      <rect width="96" height="28" rx="5" fill="#fff" stroke="#E2E8F0" />
      <text
        x="48"
        y="19"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="13"
        fontWeight="700"
        fontStyle="italic"
      >
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    </svg>
  );
}

export function StripeMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 96 28" role="img" aria-label="Stripe" className={className} {...props}>
      <rect width="96" height="28" rx="5" fill="#635BFF" />
      <text
        x="48"
        y="19"
        textAnchor="middle"
        fill="#fff"
        fontFamily="system-ui, sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="-0.2"
      >
        stripe
      </text>
    </svg>
  );
}

/** The reassurance row shown beneath the donate form. */
export function AcceptedPayments({ className }: { className?: string }) {
  const marks = [
    { Mark: MpesaMark, key: "mpesa" },
    { Mark: AirtelMark, key: "airtel" },
    { Mark: VisaMark, key: "visa" },
    { Mark: MastercardMark, key: "mastercard" },
    { Mark: PaypalMark, key: "paypal" },
    { Mark: StripeMark, key: "stripe" },
  ];

  return (
    <ul className={className}>
      {marks.map(({ Mark, key }) => (
        <li key={key} className="shrink-0">
          <Mark className="h-7 w-auto" />
        </li>
      ))}
    </ul>
  );
}
