import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms of use for the Ujasiri Community Care website.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    "heading": "This site is information, not medical advice",
    "body": [
      "Everything on this website is general health information. It is not a diagnosis, a prescription, or a substitute for seeing a qualified clinician.",
      "If you have symptoms, or you think you may have been exposed to HIV or any other infection, see a health worker. If it is an emergency, call 999 or go to the nearest facility."
    ]
  },
  {
    "heading": "Accounts",
    "body": [
      "You are responsible for keeping your password confidential and for activity under your account. Staff accounts can reach information about people we serve; sharing one is a disciplinary matter.",
      "We may suspend an account that is being misused, without notice."
    ]
  },
  {
    "heading": "Donations",
    "body": [
      "Donations are processed by third-party payment providers under their own terms. A gift is a voluntary contribution and is generally not refundable, but if you have made a mistake — a wrong amount, a duplicate — contact us and we will put it right.",
      "Where a gift is designated to a specific project that is fully funded or discontinued, we will apply it to the closest comparable work and tell you we have done so."
    ]
  },
  {
    "heading": "Content",
    "body": [
      "Text, images and data on this site belong to Ujasiri Community Care unless credited otherwise. You may quote and link to it freely with attribution. You may not present it as your own or use it to imply our endorsement.",
      "Photographs of people are published only with consent, and may not be reused for any other purpose."
    ]
  },
  {
    "heading": "Availability",
    "body": [
      "We aim to keep this site available at all times but do not guarantee it. Emergency phone numbers published here are operated by other organisations, and we cannot guarantee their availability either — though they are, in our experience, reliable."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Terms of use"}
      lead={"The rules that apply to using this website."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Terms of use", href: "/terms" },
      ]}
      sections={sections}
    />
  );
}
