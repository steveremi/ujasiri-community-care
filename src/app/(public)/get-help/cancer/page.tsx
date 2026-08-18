import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Cervical & breast screening",
  description: "Free cervical and breast cancer screening days with partner health facilities in Kenya, plus navigation support if anything is found. Ujasiri Community Care.",
  alternates: { canonical: "/get-help/cancer" },
};

const sections = [
  {
    "heading": "Who should be screened",
    "body": [
      "- Cervical screening: women aged 25 to 49 should be screened at least every five years. If you are living with HIV, screening is recommended every year and from a younger age.",
      "- Breast: know what is normal for you, and have any new lump, skin change, or nipple discharge checked. There is no age at which a change stops being worth checking."
    ]
  },
  {
    "heading": "What cervical screening involves",
    "body": [
      "It takes a few minutes. A clinician examines the cervix — either using vinegar solution, which makes abnormal cells visible immediately, or by taking a sample for HPV testing.",
      "It is not painful, though it can be uncomfortable. It is done privately by a qualified clinician, and you can ask for a female clinician.",
      "Screening is delivered at our screening days by staff from partner health facilities under their own clinical protocols. We organise the day, the transport and the follow-up."
    ]
  },
  {
    "heading": "If something is found",
    "body": [
      "A positive screen is not a cancer diagnosis. Most abnormal results are pre-cancerous changes that can be treated simply, often at the same visit.",
      "This is also the point where most women are lost — because treatment means another facility, another cost, another day away from work. So every woman who screens positive is assigned a navigator: one person who books the appointment, arranges transport and stays in contact until treatment is finished.",
      "You will not be left to work it out alone."
    ]
  },
  {
    "heading": "Prevention: the HPV vaccine",
    "body": [
      "Almost all cervical cancer is caused by HPV, and there is a vaccine for it. It is given free to girls aged 10 to 14 through Ministry of Health services.",
      "It works best before any exposure to the virus, which is why it is given at that age rather than later. If you have a daughter in that range, we can tell you where and when.",
      "The second dose is the one that matters and the one most programmes lose girls on. We follow up on it."
    ]
  },
  {
    "heading": "Breast self-examination",
    "body": [
      "Check once a month, a few days after your period ends. Look for a new lump or thickening, a change in size or shape, dimpling of the skin, a nipple that turns inward, or any discharge.",
      "Most changes are not cancer. Having one checked costs you an afternoon; not having it checked can cost considerably more."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Cervical and breast screening"}
      lead={"Cervical cancer is one of the most preventable cancers there is. Almost every death from it represents a screening that did not happen, or a result nobody followed up."}
      urgent={undefined}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Get help", href: "/get-help" },
        { name: "Cervical and breast screening", href: "/get-help/cancer" },
      ]}
      sections={sections}
    />
  );
}
