/**
 * Hero photography.
 *
 * Real photographs sourced from Unsplash — free for commercial use with no
 * attribution required under the Unsplash Licence — and downloaded into
 * /public/hero rather than hotlinked.
 *
 * Serving them locally is deliberate. Hotlinking put the hero behind a network
 * round trip to a third party on every cold render, which is fragile (the
 * image optimiser fails if that host is slow or blocked) and slow for visitors
 * on the metered mobile connections most of ours use. Local files are also
 * immune to the source silently changing or disappearing.
 *
 * ── The captioning rule, which matters more than the pictures ──────────────
 *
 * None of these people are connected to UCC, and none consented to appear
 * alongside content about HIV, TB or gender-based violence. So no caption says
 * or implies that the person shown is a client, a survivor, or living with any
 * condition.
 *
 * Every caption describes what UCC *does* — never who the person in the frame
 * *is*. "We test after dark" is fine over a community gathering. "She tested
 * positive" over the same photograph would be a fabrication about a real,
 * identifiable person, and the kind of thing that ends an organisation's
 * credibility the moment somebody recognises themselves.
 *
 * ── Replace these ─────────────────────────────────────────────────────────
 *
 * Stock photography is a placeholder for commissioned photography, not a
 * substitute. Shoot your own, with written consent on file, and swap `src` for
 * local paths under /public/hero. See public/hero/README.md for the brief.
 */

import type { HeroSlide } from "@/components/site/hero-carousel";

export const heroSlides: HeroSlide[] = [
  {
    src: "/hero/01.jpg",
    kicker: "Community outreach",
    caption: "We come to you",
    line: "Testing and screening offered where people already are — not where a clinic happens to be.",
    alt: "People gathered outside a rural homestead in East Africa",
  },
  {
    src: "/hero/02.jpg",
    kicker: "Adolescent girls",
    caption: "Somewhere to ask anything",
    line: "Safe spaces led by mentors barely older than the girls in them.",
    alt: "A woman standing with a group of children outdoors",
  },
  {
    src: "/hero/03.jpg",
    kicker: "Reaching households",
    caption: "Village by village",
    line: "A person who cannot lose a day's wages will never reach a daytime clinic.",
    alt: "People walking along a road carrying containers",
  },
  {
    src: "/hero/04.jpg",
    kicker: "Mobilisation",
    caption: "Screening days that fill",
    line: "Run with partner facilities, and staffed so nobody is turned away.",
    alt: "A group of people in brightly coloured traditional dress",
  },
  {
    src: "/hero/05.jpg",
    kicker: "After violence",
    caption: "At your pace, on your terms",
    line: "You decide what happens next. Nobody is told anything.",
    alt: "Two women sitting together in conversation",
  },
  {
    src: "/hero/06.jpg",
    kicker: "Water and distance",
    caption: "Eight kilometres is too far",
    line: "Where the nearest health post is a day's walk, we bring the service.",
    alt: "Three women carrying basins while walking",
  },
  {
    src: "/hero/07.jpg",
    kicker: "Schools",
    caption: "Reaching girls before risk does",
    line: "HPV vaccination works best years before it is needed.",
    alt: "A group of children seated together",
  },
  {
    src: "/hero/08.jpg",
    kicker: "Referral",
    caption: "We walk you to the door",
    line: "Same-day, accompanied, and you are expected when you arrive.",
    alt: "A group of people standing together in conversation outdoors",
  },
  {
    src: "/hero/09.jpg",
    kicker: "Male engagement",
    caption: "A conversation men were not invited into",
    line: "Violence prevention that speaks only to women asks the wrong people to fix it.",
    alt: "A group of men sitting together outside",
  },
  {
    src: "/hero/10.jpg",
    kicker: "Clean water",
    caption: "Health starts before the clinic",
    line: "Water, sanitation and nutrition decide who gets ill in the first place.",
    alt: "Children gathered near a village water pump",
  },
  {
    src: "/hero/11.jpg",
    kicker: "Community dialogue",
    caption: "Decisions made in the open",
    line: "Selection committees meet in public, and the list is read aloud.",
    alt: "A group of people gathered around a tree",
  },
  {
    src: "/hero/12.jpg",
    kicker: "Staying in school",
    caption: "One kit lasts three years",
    line: "Reusable pads remove the monthly reason to stay home.",
    alt: "Children in school uniform walking along a street",
  },
  {
    src: "/hero/13.jpg",
    kicker: "Rural reach",
    caption: "Where the road ends",
    line: "Our teams work in the places outreach programmes usually stop short of.",
    alt: "People crossing an open field beneath a cloudy sky",
  },
  {
    src: "/hero/14.jpg",
    kicker: "Where people already are",
    caption: "Markets, not waiting rooms",
    line: "Moonlight and market-day testing reaches people no clinic ever will.",
    alt: "A busy outdoor market scene",
  },
  {
    src: "/hero/15.jpg",
    kicker: "Follow-up",
    caption: "One week. One month. Six months.",
    line: "Staying in care is the hard part. That is the part we do.",
    alt: "Two people walking together through open grassland",
  },
  {
    src: "/hero/16.jpg",
    kicker: "Nutrition",
    caption: "Growth monitored, not guessed",
    line: "Screening under-fives and referring every case that needs more than we can give.",
    alt: "A girl in a floral dress holding green bananas",
  },
  {
    src: "/hero/17.jpg",
    kicker: "Community",
    caption: "Courage, carried together",
    line: "Ujasiri means courage. Nobody should need it alone.",
    alt: "People dancing together at a community gathering",
  },
  {
    src: "/hero/18.jpg",
    kicker: "Everyday life",
    caption: "Health belongs in ordinary places",
    line: "Not an event people travel to — a service that turns up where they live.",
    alt: "People walking past shops on a street",
  },
];
