import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Ujasiri Community Care collects, uses and protects your personal information, in line with Kenya's Data Protection Act.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    "heading": "The short version",
    "body": [
      "We collect as little as we can get away with. We never sell or share your data for marketing. Health information about clients is never stored on this website, and never disclosed to family, partners or employers.",
      "We process personal data in line with Kenya's Data Protection Act 2019."
    ]
  },
  {
    "heading": "What this website collects",
    "body": [
      "- Contact form: your name, email and message, so we can reply.",
      "- Newsletter: your email address, until you unsubscribe.",
      "- Volunteer applications: the details you enter on the form.",
      "- Donations: your name, email, amount and payment reference. Card and M-Pesa details go to the payment provider and never reach us.",
      "We deliberately do not ask for health information anywhere on this site. If your situation is sensitive, call us or come and see us instead."
    ]
  },
  {
    "heading": "Client records",
    "body": [
      "Records created in the course of our services — testing, screening, GBV case management — are held separately from this website, on restricted-access systems, and are governed by our confidentiality policy.",
      "They are never published, never used in fundraising material, and never disclosed to a third party without your written consent, except where the law requires it (principally where a child is at risk of harm)."
    ]
  },
  {
    "heading": "Cookies",
    "body": [
      "This site uses only the cookies it needs to work — principally a session cookie once you sign in to a staff account. There is no advertising tracking and no third-party analytics profiling."
    ]
  },
  {
    "heading": "How long we keep things",
    "body": [
      "- Contact enquiries: two years.",
      "- Newsletter subscriptions: until you unsubscribe.",
      "- Volunteer applications: one year if unsuccessful.",
      "- Donation records: seven years, as required for financial audit."
    ]
  },
  {
    "heading": "Your rights",
    "body": [
      "You can ask us for a copy of the personal data we hold about you, ask us to correct it, or ask us to delete it — subject to records we are legally required to retain.",
      "Email us and we will respond within thirty days. If you are not satisfied, you can complain to the Office of the Data Protection Commissioner."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Privacy policy"}
      lead={"What we collect, why, how long we keep it, and what you can ask us to do about it."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Privacy policy", href: "/privacy" },
      ]}
      sections={sections}
    />
  );
}
