/**
 * Single source of truth for organisation identity.
 *
 * Everything that renders the NGO's name, contact details, registration
 * numbers or social profiles reads from here — including the JSON-LD block and
 * the sitemap. Change it once, it changes everywhere, and the structured data
 * stays consistent with the visible page (which is what search engines check).
 */

export const site = {
  name: "Ujasiri Community Care",
  shortName: "UCC",
  legalName: "Ujasiri Community Care",
  tagline: "Courage, carried together.",
  description:
    "Ujasiri Community Care is a community health NGO working on HIV and TB prevention, cancer awareness, gender-based violence response, and health services for adolescent girls and young women — connecting people to care through partner facilities and government services.",

  /** One sentence a first-time visitor should be able to act on. */
  mission:
    "We bring HIV testing, TB screening, cancer awareness, GBV support and adolescent girls' health services into the community — and walk people to the door of the care they need.",

  // Set NEXT_PUBLIC_SITE_URL in production; canonical URLs and sitemap depend on it.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  founded: "2016",

  // Shown on the transparency page and in the footer. These are the single
  // strongest trust signals a visitor can check independently — keep accurate.
  registration: {
    label: "NGO Registration No.",
    number: "OP/218/2016/0142",
    authority: "NGO Co-ordination Board",
    taxLabel: "Tax Exemption (PBO)",
    taxNumber: "EXN/0148/2019",
  },

  /**
   * `.or.ke` is a restricted namespace: only registered Kenyan non-profits can
   * hold one, so the address itself is a verifiable trust signal that a `.org`
   * cannot give. The county health teams and national programmes we refer into
   * read it that way. Register the `.org` as well and redirect it, so
   * international donors who guess wrong still arrive.
   */
  contact: {
    email: "info@ujasiricommunitycare.or.ke",
    supportEmail: "give@ujasiricommunitycare.or.ke",
    safeguardingEmail: "safeguarding@ujasiricommunitycare.or.ke",
    /** First number to try; the rest are in `customerCare.lines`. */
    phone: "0708 417 002",
    address: {
      street: "Ujasiri House, Kenyatta Avenue",
      locality: "Nanyuki",
      region: "Laikipia County",
      postalCode: "10400",
      country: "KE",
      countryName: "Kenya",
    },
    hours: "Monday – Friday, 8:30am – 5:00pm EAT",
  },

  /**
   * Crisis routes. On a site covering GBV and HIV, somebody will arrive here
   * needing help now — not information. These are surfaced above the fold on
   * every page, and the national lines are listed first because they answer
   * 24 hours a day and we do not.
   */
  help: {
    urgentNote:
      "If you are in immediate danger, call 999 or 112. After sexual violence, medicine that prevents HIV works best within 72 hours — go to a health facility as soon as you can.",
    lines: [
      { label: "UCC hotline", number: "0713 528 910", note: "Confidential — call or text" },
      { label: "UCC hotline (alternative)", number: "0703 389 842", note: "If the first line is engaged" },
    ],
  },

  /**
   * Partner service directory people can reach on their own, without waiting
   * for one of our outreach teams to be nearby. Linked from /get-help and the
   * partners page, because "we are not in your county this month" is a bad
   * place for a health pathway to end.
   */
  referralPartner: {
    name: "Stawisha Care",
    url: "https://stawishacare.org",
    blurb:
      "HIV prevention, TB and a wider range of health services, accessible online. If we are not working near you, start there.",
  },

  /**
   * General enquiries — not the crisis hotline. Listed in the order they
   * should be tried, with no "main" or "alternative" labelling: a caller does
   * not need the internal hierarchy, only a number that will be answered.
   */
  customerCare: {
    lines: ["0708 417 002", "0705 385 651", "0702 841 059"],
    hours: "Monday – Friday, 8:30am – 5:00pm EAT",
  },

  /**
   * External bodies we work under or refer into. Every serious Kenyan health
   * NGO publishes this — CHAK and Ciheb both do — because linking to the
   * regulator and the national programmes is a check a visitor can follow, not
   * a claim they have to accept.
   */
  quickLinks: [
    { label: "Ministry of Health", href: "https://www.health.go.ke" },
    { label: "NGO Co-ordination Board", href: "https://ngobureau.go.ke" },
    { label: "National Syndemic Disease Control Council", href: "https://nsdcc.go.ke" },
    { label: "National TB Programme", href: "https://nltp.co.ke" },
    { label: "Social Health Authority", href: "https://sha.go.ke" },
    { label: "Kenya Medical Supplies Authority", href: "https://kemsa.co.ke" },
    { label: "World Health Organization", href: "https://www.who.int" },
    { label: "Council of Governors — Health", href: "https://cog.go.ke" },
  ],

  social: {
    twitter: "https://twitter.com/ujasiricare",
    facebook: "https://facebook.com/ujasiricare",
    instagram: "https://instagram.com/ujasiricare",
    linkedin: "https://linkedin.com/company/ujasiricare",
    youtube: "https://youtube.com/@ujasiricare",
  },

  twitterHandle: "@ujasiricare",

  poweredBy: {
    name: "Alvania Group",
    url: "https://alvaniagroup.com",
  },
} as const;

/**
 * Primary navigation. Kept short on purpose — visitors decide in seconds.
 * "Get help" sits first because on this site it is the most urgent need.
 */
export const primaryNav = [
  { label: "Home", href: "/" },
  {
    label: "Get help",
    href: "/get-help",
    highlight: true,
    children: [
      { label: "Find services near you", href: "/get-help", desc: "Testing, screening and support" },
      { label: "After sexual violence", href: "/get-help/gbv", desc: "What to do in the first 72 hours" },
      { label: "HIV testing & PrEP", href: "/get-help/hiv", desc: "Free, confidential, no appointment" },
      { label: "TB symptoms", href: "/get-help/tb", desc: "How to get screened" },
    ],
  },
  {
    label: "Our work",
    href: "/programs",
    children: [
      { label: "Programmes", href: "/programs", desc: "The five areas we work in" },
      { label: "Projects", href: "/projects", desc: "Where we work, right now" },
      { label: "Impact", href: "/impact", desc: "Results, measured and published" },
      { label: "Stories", href: "/stories", desc: "Voices from the communities" },
    ],
  },
  {
    label: "Who we are",
    href: "/about",
    children: [
      { label: "About Ujasiri", href: "/about", desc: "Our story, mission and values" },
      { label: "Our team", href: "/team", desc: "The people doing the work" },
      { label: "Governance", href: "/governance", desc: "Board, policies and safeguarding" },
      { label: "Partners & referrals", href: "/partners", desc: "Who we refer you to" },
    ],
  },
  {
    label: "Transparency",
    href: "/transparency",
    children: [
      { label: "Finances", href: "/transparency", desc: "Where every shilling goes" },
      { label: "Annual reports", href: "/reports", desc: "Audited, published yearly" },
      { label: "Accountability", href: "/accountability", desc: "How to raise a concern" },
    ],
  },
  {
    label: "Get involved",
    href: "/get-involved",
    children: [
      { label: "Volunteer", href: "/get-involved/volunteer", desc: "Give time and skill" },
      { label: "Partner with us", href: "/get-involved/partner", desc: "Facilities, NGOs and government" },
      { label: "Fundraise", href: "/get-involved/fundraise", desc: "Run a campaign for UCC" },
      { label: "Donate", href: "/donate", desc: "Support the work directly" },
    ],
  },
] as const;

/**
 * Secondary destinations, shown as a rail across the foot of the hero rather
 * than in the primary bar. They matter, but they are not what a first-time
 * visitor is looking for — and a nav with nine items is a nav nobody reads.
 */
export const heroNav = [
  { label: "Our programmes", href: "/programs" },
  { label: "Projects", href: "/projects" },
  { label: "Impact", href: "/impact" },
  { label: "News", href: "/news" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = [
  {
    title: "Get help",
    links: [
      { label: "Find services", href: "/get-help" },
      { label: "After sexual violence", href: "/get-help/gbv" },
      { label: "HIV testing & PrEP", href: "/get-help/hiv" },
      { label: "TB screening", href: "/get-help/tb" },
      { label: "Cancer screening", href: "/get-help/cancer" },
    ],
  },
  {
    title: "Our work",
    links: [
      { label: "Programmes", href: "/programs" },
      { label: "Projects", href: "/projects" },
      { label: "Impact", href: "/impact" },
      { label: "Stories", href: "/stories" },
      { label: "News", href: "/news" },
  { label: "Opportunities", href: "/opportunities" },
    ],
  },
  {
    title: "Who we are",
    links: [
      { label: "About Ujasiri", href: "/about" },
      { label: "Our team", href: "/team" },
      { label: "Governance", href: "/governance" },
      { label: "Partners & referrals", href: "/partners" },
      { label: "Opportunities", href: "/opportunities" },
    ],
  },
  {
    title: "Transparency",
    links: [
      { label: "Where the money goes", href: "/transparency" },
      { label: "Annual reports", href: "/reports" },
      { label: "Accountability", href: "/accountability" },
      { label: "Safeguarding policy", href: "/governance#safeguarding" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
  {
    title: "Take action",
    links: [
      { label: "Donate", href: "/donate" },
      { label: "Volunteer", href: "/get-involved/volunteer" },
      { label: "Fundraise", href: "/get-involved/fundraise" },
      { label: "Contact us", href: "/contact" },
    ],
  },
] as const;
