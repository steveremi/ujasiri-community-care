import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Fundraise for us",
  description: "Run a fundraising campaign for Ujasiri Community Care \u2014 birthdays, workplace giving, events and challenges.",
  alternates: { canonical: "/get-involved/fundraise" },
};

const sections = [
  {
    "heading": "What we will give you",
    "body": [
      "- Real numbers you can quote, with the source, so you are never caught out.",
      "- Photographs cleared for public use, with consent already on file.",
      "- A named person at UCC to contact, not a shared inbox.",
      "- A written acknowledgement of what was raised, and a note later on what it paid for."
    ]
  },
  {
    "heading": "Ideas that work",
    "body": [
      "- Mark a birthday or anniversary by asking for gifts to UCC instead of presents.",
      "- Ask your employer about matched giving — many will double what staff raise.",
      "- Run a challenge: a race, a climb, a sponsored anything.",
      "- Organise a workplace collection tied to World AIDS Day, World TB Day, or the 16 Days of Activism.",
      "- Ask your professional body or faith community to adopt one project for a year."
    ]
  },
  {
    "heading": "Please tell us first",
    "body": [
      "Not to control it — so we can support it, and so we can make sure nobody is fundraising in our name who should not be.",
      "Anyone raising money as UCC must have our written agreement. If someone approaches you claiming to collect for us and you are unsure, call the office and check."
    ]
  },
  {
    "heading": "Talking about our work responsibly",
    "body": [
      "We work in HIV, TB and gender-based violence, and how the work is described matters:",
      "- Never name or identify a client, in any material, ever.",
      "- Do not use images of identifiable people unless we have supplied them.",
      "- Avoid framing that presents people as helpless. The people we work with are managing difficult circumstances competently, usually with fewer resources than the person reading your appeal.",
      "We will help you get the tone right. Ask."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Fundraise for us"}
      lead={"If you are willing to ask people for money on our behalf, we will make it as easy as we can."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Fundraise for us", href: "/get-involved/fundraise" },
      ]}
      sections={sections}
    />
  );
}
