import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "HIV testing & PrEP",
  description: "Free, confidential HIV testing in the community \u2014 no appointment, no ID, no cost. Plus PrEP information and same-day linkage to treatment. Ujasiri Community Care, Kenya.",
  alternates: { canonical: "/get-help/hiv" },
};

const sections = [
  {
    "heading": "What a test actually involves",
    "body": [
      "A finger-prick, a few drops of blood, and a result in about twenty minutes. It is done in private, by someone trained to talk you through it before and after.",
      "You do not need an appointment, an ID, or money. Nobody asks why you came."
    ]
  },
  {
    "heading": "If the result is negative",
    "body": [
      "We will talk about staying negative — condoms, and whether PrEP makes sense for you.",
      "PrEP is a daily tablet that prevents HIV infection. It is free at public health facilities in Kenya, and it works. If you would benefit from it, we will refer you directly to a facility PrEP clinic and follow up to check you got there.",
      "If you were exposed in the last 72 hours, ask about PEP instead — that is emergency prevention, and it is urgent."
    ]
  },
  {
    "heading": "If the result is positive",
    "body": [
      "It is not the news anyone wants. It is also, now, a manageable condition: with treatment, people living with HIV live a normal lifespan and cannot pass the virus to a partner once the virus is undetectable.",
      "What happens next is up to you, but here is what we offer:",
      "- We will go with you to a health facility the same day, if you want that.",
      "- Treatment is free at public facilities.",
      "- Someone will follow up with you at one week, one month and six months — not to check on you, but because staying in care is the hard part and everyone deserves help with it.",
      "We will never tell anyone your result. Not your partner, not your family, not your employer."
    ]
  },
  {
    "heading": "Testing at home",
    "body": [
      "If you would rather not test in front of anyone, ask for a self-test kit. You use it privately, and we will call you afterwards if you want us to — or not, if you would rather we did not.",
      "A reactive self-test result always needs a confirmatory test at a facility. We will help you get one."
    ]
  },
  {
    "heading": "Testing a partner or family member",
    "body": [
      "If you test positive, we may offer to test your partner or children. This is offered, never required, and declining changes nothing about your own care.",
      "If you think telling a partner could put you at risk of violence, tell us. We will not proceed, and we will help you think through what is safe."
    ]
  },
  {
    "heading": "When and where we test",
    "body": [
      "We run community testing during the day and at night, because a daytime clinic is useless to someone who cannot afford to lose a day's wages. Call us and we will tell you when we are next near you."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"HIV testing and prevention"}
      lead={"Testing is free, takes about twenty minutes, and nobody is told the result but you."}
      urgent={undefined}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Get help", href: "/get-help" },
        { name: "HIV testing and prevention", href: "/get-help/hiv" },
      ]}
      sections={sections}
    />
  );
}
