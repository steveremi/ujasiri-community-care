import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "After sexual violence",
  description: "What to do after sexual violence in Kenya: the 72-hour window for HIV prevention, where to go, and what happens. Free, confidential support from Ujasiri Community Care.",
  alternates: { canonical: "/get-help/gbv" },
};

const sections = [
  {
    "heading": "You decide what happens next",
    "body": [
      "Nobody here will make you do anything. Not report to the police, not tell your family, not be tested. We will explain the options, and support whichever ones you choose — including choosing none of them.",
      "If you change your mind later, that is fine. You can come back at any time."
    ]
  },
  {
    "heading": "The first 72 hours matter medically",
    "body": [
      "This is the one part that is time-sensitive, which is why we say it first:",
      "- Post-exposure prophylaxis (PEP) can prevent HIV infection, but it must begin within 72 hours of exposure. The sooner the better.",
      "- Emergency contraception can prevent pregnancy for up to 120 hours (5 days).",
      "- Treatment for other sexually transmitted infections can be started at the same visit.",
      "- Injuries can be treated, and evidence can be collected if you might want to report later — collecting it does not commit you to anything.",
      "You do not need to report to the police to receive medical care. Care is not conditional on reporting."
    ]
  },
  {
    "heading": "Where to go",
    "body": [
      "Any health facility can help, and larger ones have a designated post-rape care service. We hold standing referral agreements with facilities in the counties we work in, which means when we send you, you are expected on arrival rather than explaining yourself at a reception desk.",
      "If you want someone with you, we will come. Say so when you call.",
      "Try not to bathe, change clothes or wash the clothes you were wearing before you are seen — but if you already have, still go. Care is still worth having."
    ]
  },
  {
    "heading": "If you want to report",
    "body": [
      "Reporting is your choice, and it can be made later — it does not have to be today.",
      "- Police gender desks handle these cases and we can tell you which stations near you have one that is staffed.",
      "- A P3 form is the medical-legal document used in Kenyan cases. A facility can complete it.",
      "- Legal aid partners can represent you at no cost if you decide to pursue a case.",
      "We will accompany you to any of these if you want company."
    ]
  },
  {
    "heading": "What we will never do",
    "body": [
      "- Tell your family, your partner, your employer or your community anything.",
      "- Pressure you into testing, reporting, or any decision.",
      "- Put your name or your story on this website, in a report, or on social media.",
      "The one exception, which we tell everyone up front: where a child is at risk of harm, we have a legal duty to act. We will always explain this to you before you tell us anything."
    ]
  },
  {
    "heading": "Support after the first days",
    "body": [
      "The medical window closes quickly; recovery does not work to that timetable. Our safe spaces offer psychosocial support with trained staff, for as long as you want it, at whatever pace suits you.",
      "There is no expiry on asking for help. If something happened years ago and you want to talk about it now, you are welcome here."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"After sexual violence"}
      lead={"What happened was not your fault. This page explains what you can do now, what each option involves, and what we will and will not do without your agreement."}
      urgent={"Medicine that prevents HIV (PEP) works best if you start it within 72 hours. Emergency contraception works up to 120 hours. Go to a health facility as soon as you can \u2014 you do not need to report to the police first."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Get help", href: "/get-help" },
        { name: "After sexual violence", href: "/get-help/gbv" },
      ]}
      sections={sections}
    />
  );
}
