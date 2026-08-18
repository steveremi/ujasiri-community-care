import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "TB screening",
  description: "Free TB screening and testing in the community. A cough lasting more than two weeks should be checked. Ujasiri Community Care, Kenya.",
  alternates: { canonical: "/get-help/tb" },
};

const sections = [
  {
    "heading": "Signs worth checking",
    "body": [
      "See someone if you have any of these, and especially if you have several:",
      "- A cough lasting more than two weeks",
      "- Coughing up blood",
      "- Fever, especially in the evenings",
      "- Night sweats that soak your clothes or bedding",
      "- Losing weight without trying",
      "- Chest pain, or unusual tiredness",
      "These can be caused by many things. That is exactly why they are worth checking rather than waiting out."
    ]
  },
  {
    "heading": "How screening works",
    "body": [
      "We ask about your symptoms. If anything suggests TB, we help you produce a sputum sample — this is the awkward part, and our staff are used to it.",
      "We transport the sample to a partner diagnostic laboratory ourselves, and a community health promoter brings the result back to you, usually within three days. You do not have to travel for either step."
    ]
  },
  {
    "heading": "If you have TB",
    "body": [
      "Treatment is free, it works, and it takes six months.",
      "The six months is the difficulty. People start feeling better after about two, and stop. Stopping early lets the infection come back, and come back harder to treat.",
      "So we assign a treatment supporter who stays in contact with you every week for the whole course, and who will come looking if you miss a facility appointment. If transport cost is what is stopping you, we can help with that too."
    ]
  },
  {
    "heading": "People you live with",
    "body": [
      "TB spreads through the air, so anyone sharing your home should be screened. We do this at your home rather than asking everyone to travel.",
      "Children and people living with HIV who have been exposed can be given preventive treatment that stops them developing TB at all. We will refer them for it."
    ]
  },
  {
    "heading": "TB and HIV",
    "body": [
      "The two are closely linked: TB is the most common serious infection among people living with HIV. If you are screened for one, we will offer the other. Both are free, both are confidential, and you can decline either."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"TB symptoms and screening"}
      lead={"Tuberculosis is curable, and free to treat. The problem is that it is usually found late."}
      urgent={undefined}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Get help", href: "/get-help" },
        { name: "TB symptoms and screening", href: "/get-help/tb" },
      ]}
      sections={sections}
    />
  );
}
