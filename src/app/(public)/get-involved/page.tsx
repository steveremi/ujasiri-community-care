import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Get involved",
  description: "Volunteer, partner, fundraise or donate \u2014 ways to support HIV, TB, cancer and GBV work with Ujasiri Community Care in Kenya.",
  alternates: { canonical: "/get-involved" },
};

const sections = [
  {
    "heading": "What we need most",
    "body": [
      "Money, and specifically unrestricted monthly money. It is the least romantic answer and the true one.",
      "Restricted grants pay for activities. What they rarely pay for is the follow-up call at six months, the transport stipend that gets someone to their appointment, or the staff member who notices a client has stopped coming. Unrestricted giving pays for those, and those are what decide whether any of this works."
    ]
  },
  {
    "heading": "Volunteer",
    "body": [
      "We take volunteers in two intakes a year, across community outreach, tutoring in safe spaces, monitoring and data, and administration.",
      "Every volunteer role requires a background check and safeguarding induction before you start. Expect to commit at least six months — the communities we work in have had enough of people who appear and vanish."
    ]
  },
  {
    "heading": "Partner with us",
    "body": [
      "We work with health facilities, county governments, national programmes and other NGOs. If you run a service we could refer to, or you need a community-side partner who can actually reach people, get in touch.",
      "We are equally interested in partners who will tell us when we are getting something wrong."
    ]
  },
  {
    "heading": "Fundraise",
    "body": [
      "Run a campaign, mark a birthday, or ask your employer about matched giving. We will give you the materials, the real numbers, and a named person to contact — not a form."
    ]
  },
  {
    "heading": "Give in kind",
    "body": [
      "Occasionally useful: transport, venue space, printing, professional services (legal, audit, clinical training). Rarely useful: unsolicited goods that cost more to store and distribute than they are worth. Ask us first and we will tell you honestly."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Get involved"}
      lead={"Four ways to help, and an honest note on which of them we need most."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Get involved", href: "/get-involved" },
      ]}
      sections={sections}
    />
  );
}
