import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Governance",
  description: "How Ujasiri Community Care is governed: our board, our safeguarding policy, our conflict of interest rules, and how to raise a concern.",
  alternates: { canonical: "/governance" },
};

const sections = [
  {
    "heading": "Our board",
    "body": [
      "UCC is governed by a board of trustees who are unpaid and independent of management. Trustees serve four-year terms, renewable once, and are recruited openly rather than by invitation.",
      "The board meets quarterly. It approves the annual budget, receives the audit, and holds the Executive Director to account. Two committees report to it: finance and audit, and safeguarding.",
      "At least one trustee lives in a county where we work. This is deliberate — a board with no community-side voice is a board that hears only what management chooses to tell it."
    ]
  },
  {
    "heading": "Safeguarding",
    "body": [
      "We work with people affected by HIV, TB and gender-based violence, including children and adolescents. That carries a duty of care that goes well beyond ordinary employment policy.",
      "- Every staff member, volunteer and trustee completes safeguarding training annually. There are no exemptions, including for the board.",
      "- All staff and volunteers in contact with clients undergo background checks before they start.",
      "- Concerns can be reported through a channel that is independent of UCC management and reaches trustees directly.",
      "- Any report of harm involving a child triggers mandatory action under Kenyan law, and we tell clients this before they disclose anything to us.",
      "- Client information is stored under lock with restricted access, and no client identifier is ever entered into this website."
    ]
  },
  {
    "heading": "Confidentiality",
    "body": [
      "A person's HIV status, TB diagnosis, or disclosure of violence is never shared with family, partners, employers or the community. Not by staff, not by volunteers, not in a report, not on social media.",
      "Breaching confidentiality is treated as gross misconduct. In this sector it is not an administrative failure — it can end someone's marriage, their job, or their life."
    ]
  },
  {
    "heading": "Conflicts of interest",
    "body": [
      "Trustees and senior staff declare interests annually, and declare any specific conflict at the point a relevant decision arises. Anyone with a conflict leaves the room for that decision.",
      "We do not procure goods or services from an organisation connected to a trustee or member of staff without an open competitive process and a recorded board decision."
    ]
  },
  {
    "heading": "Policies",
    "body": [
      "The following are approved by the board and reviewed at least every two years: safeguarding and child protection; confidentiality and data protection; whistleblowing; anti-fraud and bribery; procurement; human resources; and health and safety.",
      "Copies are available on request. Email us and we will send them."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Governance"}
      lead={"Who holds us to account, how decisions get made, and what you can do if we get something wrong."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Governance", href: "/governance" },
      ]}
      sections={sections}
    />
  );
}
