import type { Metadata } from "next";

import { InfoPage } from "@/components/site/info-page";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Our commitment to making the Ujasiri Community Care website usable by everyone, and how to tell us when we fall short.",
  alternates: { canonical: "/accessibility" },
};

const sections = [
  {
    "heading": "What we have built in",
    "body": [
      "- Every interactive element is reachable and operable by keyboard alone, with a clearly visible focus ring.",
      "- Text meets WCAG AA contrast against its background throughout.",
      "- Images carry meaningful alternative text; decorative ones are hidden from screen readers rather than described pointlessly.",
      "- The hero slideshow stops automatically if your device requests reduced motion, and can be paused manually.",
      "- Pages are structured with real headings and landmarks, so a screen reader can navigate by section.",
      "- Text resizes without breaking the layout, and the page never scrolls sideways on a phone."
    ]
  },
  {
    "heading": "Built for the connection you actually have",
    "body": [
      "Most of the people this site is for are on an entry-level Android phone and a metered connection. Pages are served as static HTML wherever possible, images are compressed and lazily loaded, and there is no heavy third-party script.",
      "Emergency phone numbers are plain text and links — they render even if everything else fails to load."
    ]
  },
  {
    "heading": "Where we know we fall short",
    "body": [
      "The site is currently in English only. Kiswahili is a priority, and it matters more than most of what is on our roadmap.",
      "Some documents are provided as PDFs on request, and not all of them are tagged for screen readers. Ask us and we will send you the content in an accessible format."
    ]
  },
  {
    "heading": "Tell us",
    "body": [
      "If something on this site does not work for you, we want to know. Email us with what you were trying to do and what happened, and we will fix it and reply to tell you when."
    ]
  }
];

export default function Page() {
  return (
    <InfoPage
      title={"Accessibility"}
      lead={"This site should work for everyone who needs it \u2014 including on an old phone, a slow connection, or with a screen reader."}
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Accessibility", href: "/accessibility" },
      ]}
      sections={sections}
    />
  );
}
