import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Partner with Ujasiri Community Care \u2014 health facilities, county governments, national programmes, NGOs and corporate partners.",
  alternates: { canonical: "/get-involved/partner" },
};

const sections = [
  {
    "heading": "Health facilities",
    "body": [
      "If you run a facility with capacity that is not being used — a PrEP clinic with empty slots, a screening service nobody is arriving at — we can probably fill it.",
      "A referral partnership with us means: standing agreement, named contact on both sides, clients accompanied where they want it, and quarterly joint review of how many people we sent and how many arrived."
    ]
  },
  {
    "heading": "County governments and national programmes",
    "body": [
      "We work inside government systems rather than building parallel ones. HPV vaccination is a Ministry of Health service; TB diagnosis runs on national protocols; HIV treatment happens at public facilities.",
      "Our contribution is mobilisation, transport, logistics and the follow-up that facility staff do not have time for."
    ]
  },
  {
    "heading": "Other NGOs",
    "body": [
      "We refer out constantly — legal aid, shelter, mental health, disability services, livelihoods. If you offer something our clients need and we are not already referring to you, that is a gap worth closing."
    ]
  },
  {
    "heading": "Corporate partners",
    "body": [
      "Beyond funding: payroll giving, matched giving, pro bono professional services, and occasionally logistics. Our technology systems are built and maintained pro bono by Alvania Group, which is the model we would point to.",
      "We do not accept partnerships that require us to promote a product to clients, or that come with conditions on what we can publish about our own results."
    ]
  },
  {
    "heading": "How to start",
    "body": [
      "Email us with what you do and what you think the overlap is. We will come back within a week, and we would rather have a short honest call than exchange concept notes for a month."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Partner with us"}
      lead={"We are a community-side organisation. We are most useful to people who have a service and need it reached."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Partner with us", href: "/get-involved/partner" },
      ]}
      sections={sections}
    />
  );
}
