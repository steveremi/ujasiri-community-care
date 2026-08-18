/**
 * Demonstration content.
 *
 * Used only when Supabase is not configured, so the site is complete and
 * reviewable before any keys exist. Every repository function falls back to
 * this data; none of it is referenced once the database is live.
 *
 * Reach figures are deliberately zero here. They are programme results, so
 * they belong in the database — entered and updated from the admin by someone
 * holding `content:edit`, and traceable to your own M&E data. A figure typed
 * into a source file is one nobody can correct without a developer, and one
 * with no record of who published it.
 *
 * TWO THINGS TO CHANGE BEFORE LAUNCH:
 *
 * 1. The figures are placeholders. Replace them with numbers you can evidence
 *    from your own M&E data or an audit. Publishing an unverifiable impact
 *    claim is the fastest way for a health NGO to lose the trust this site
 *    exists to earn.
 *
 * 2. No person described here is real, and that is deliberate. UCC works in
 *    HIV, TB and GBV — areas where being identified as a client carries real
 *    risk of stigma, violence or loss of employment. Client stories must be
 *    published only with written informed consent, and by default should be
 *    de-identified: no full name, no photograph, no detail that locates a
 *    person to a village. See src/lib/safeguarding.ts.
 */

import type {
  EventItem,
  JobOpening,
  FinanceLine,
  ImpactStat,
  Partner,
  Post,
  Program,
  Project,
  TeamMember,
} from "@/lib/types";

export const programs: Program[] = [
  {
    id: 1,
    slug: "hiv-prevention",
    title: "HIV Prevention, Testing & Linkage",
    summary:
      "Community-based HIV testing, PrEP awareness and same-day linkage to care — meeting people where stigma keeps them away from the clinic.",
    body: `The gap in HIV care is rarely the treatment. It is the distance between a person who suspects they may be positive and a clinic door they are afraid to walk through.

We work in that gap. Our teams run community and door-to-door HIV testing services, moonlight testing at venues and hotspots where daytime outreach never reaches, and index testing offered — never pressured — to the partners and children of people newly diagnosed.

## Linkage is the whole point

A test result changes nothing on its own. Every client who tests positive is escorted, physically and on the same day where they consent to it, to a facility we have a referral agreement with. A community linkage officer follows up at one week, one month and three months, and we report the proportion still in care at six months rather than the number of tests performed.

## Prevention

We provide condoms and lubricant, run PrEP demand-creation for populations at substantial risk, and refer directly to facility PrEP clinics. For clients who decline testing, we offer HIV self-test kits with a follow-up call — a lower-threshold option that reaches people no other approach does.

## Confidentiality

Testing is offered in private. Results are never disclosed to a family member, employer or partner by us, under any circumstance. Our registers are stored under lock with restricted access, and no client identifier is ever entered into this website.`,
    icon: "Ribbon",
    cover_image: "/programs/hiv-prevention.jpg",
    accent: "teal",
    status: "published",
    sort_order: 1,
    people_reached: 0,
  },
  {
    id: 2,
    slug: "tb-prevention",
    title: "TB Screening, Referral & Treatment Support",
    summary:
      "Active case finding in households and congregate settings, sputum transport to diagnostic facilities, and treatment adherence support to completion.",
    body: `Tuberculosis is curable and still kills, largely because it is found late. Kenya's missing-case problem is a finding problem, not a treatment one.

## Active case finding

We screen for TB symptoms at every community contact point — HIV testing sites, GBV safe spaces, AGYW sessions — because the same households carry overlapping risk. Presumptive cases are supported to produce a sputum sample, which our team transports to a partner diagnostic facility, with the result returned to the client by a community health promoter.

## Contact investigation

For every confirmed case, we screen household contacts and refer eligible children and people living with HIV for TB preventive therapy.

## Adherence to completion

TB treatment runs for six months and people stop when they feel better. Our treatment supporters make weekly contact through the full course, trace anyone who misses a facility appointment within 48 hours, and provide a small transport stipend where cost is the barrier. We report treatment completion rate, not treatment initiation.`,
    icon: "Stethoscope",
    cover_image: "/programs/tb-prevention.jpg",
    accent: "navy",
    status: "published",
    sort_order: 2,
    people_reached: 0,
  },
  {
    id: 3,
    slug: "cancer-awareness",
    title: "Cancer Awareness & Screening Navigation",
    summary:
      "Cervical and breast cancer awareness, community screening days with partner facilities, and navigation support for every woman who screens positive.",
    body: `Cervical cancer is the leading cause of cancer death among women in Kenya, and it is one of the most preventable cancers there is. Almost every death represents a screening that did not happen or a positive result that was never followed up.

## Awareness

We run community education on cervical and breast cancer: what the risk factors are, why HPV vaccination for girls matters years before it matters, how to perform breast self-examination, and what screening actually involves — because fear of the procedure is a barrier as real as distance.

## Screening days

We do not screen. We organise. Screening days are run at or with partner health facilities using their clinical staff and protocols — visual inspection with acetic acid or HPV DNA testing, and clinical breast examination. Our role is mobilisation, transport, and making sure the day is staffed enough that nobody is turned away.

## Navigation is where we add most value

A positive screen result is the point at which most women are lost. Treatment means another facility, another cost, another day away from work. Every woman who screens positive is assigned a navigator who books the appointment, arranges transport, and stays in contact until treatment is complete or a diagnosis is confirmed and care has begun.`,
    icon: "HeartPulse",
    cover_image: "/programs/cancer-awareness.jpg",
    accent: "teal",
    status: "published",
    sort_order: 3,
    people_reached: 0,
  },
  {
    id: 4,
    slug: "gbv-response",
    title: "Stop GBV · Prevention & Survivor Support",
    summary:
      "Prevention work with communities, and a survivor-centred referral pathway to clinical care, police and legal aid — at the survivor's pace and on the survivor's terms.",
    body: `Gender-based violence work carries a duty of care that no other programme here does. A mistake in this programme does not waste money; it puts someone in danger.

## Survivor-centred, without exception

A survivor decides what happens next. Not us, not their family, not a well-meaning volunteer. Our staff explain the options — clinical care, police reporting, legal aid, psychosocial support, a safe space — and support whichever the survivor chooses, including choosing none of them.

## The 72-hour message

Post-exposure prophylaxis to prevent HIV transmission must begin within 72 hours, and emergency contraception within 120. Getting that single fact into a community is one of the highest-value things this programme does, and we repeat it everywhere: at AGYW sessions, on radio, in every safe space.

## The referral pathway

We are not a clinical or legal service. We maintain standing referral agreements with designated facilities offering post-rape care, with gender desks at named police stations, and with legal aid partners. Referrals are accompanied where the survivor wants company.

## Prevention

Community dialogues with men and boys, school-based work on consent and respectful relationships, and training for community leaders on how to respond when a disclosure is made to them.

## Confidentiality

GBV case information is never entered into this website, never discussed outside the case management process, and never disclosed to family. Our staff are trained that a disclosure of violence made in confidence stays in confidence, subject only to mandatory reporting where a child is at risk.`,
    icon: "ShieldCheck",
    cover_image: "/programs/gbv-response.jpg",
    accent: "navy",
    status: "published",
    sort_order: 4,
    people_reached: 0,
  },
  {
    id: 5,
    slug: "agyw-health",
    title: "Adolescent Girls & Young Women",
    summary:
      "HPV vaccination access, reusable sanitary pads and menstrual health education, and safe spaces where girls can ask the questions they cannot ask elsewhere.",
    body: `Adolescent girls and young women carry a disproportionate share of new HIV infections, of GBV, and of the cervical cancer burden that begins with an HPV infection acquired in their teens. The interventions that change all three overlap almost completely, so we run them as one programme.

## HPV vaccination

We mobilise for HPV vaccination of girls aged 10 to 14 and link them to Ministry of Health vaccination services and partner facilities. Our work is demand creation, consent conversations with parents and guardians, transport and follow-up for the second dose — which is where most vaccination programmes lose girls.

## Reusable sanitary pads

We distribute reusable sanitary pad kits with washing and hygiene guidance. Reusable rather than disposable is a deliberate choice: a kit lasts up to three years, which removes the monthly cost that causes girls to miss school in the first place, and it does not create a supply dependency we cannot sustain.

Each kit is distributed alongside menstrual health education for the girls and, separately, for boys in the same school — because ridicule is as much a reason for missed school days as the lack of a pad.

## Safe spaces

Weekly facilitated sessions where girls discuss sexual and reproductive health, consent, HIV prevention, and what to do after violence. Sessions are led by mentors only a few years older than the participants, which is the single design choice that most affects whether girls speak.`,
    icon: "Sparkles",
    cover_image: "/programs/agyw-health.jpg",
    accent: "teal",
    status: "published",
    sort_order: 5,
    people_reached: 0,
  },
  {
    id: 6,
    slug: "emtct",
    title: "Stopping HIV Passing to Newborns",
    summary:
      "No baby should be born with HIV. We keep mothers living with HIV in treatment through pregnancy and breastfeeding — and support them to build a future beyond the diagnosis.",
    body: `A child born to a mother living with HIV can be born HIV-free. That outcome is almost entirely decided by whether the mother is on treatment and stays on it — through pregnancy, through delivery, and through the whole breastfeeding period.

Kenya has come a long way: antenatal HIV testing coverage now sits around 90%. But the transmission rate is still roughly 9%, against a national elimination target of under 5%. The gap is not testing. It is retention.

## Where children are actually infected

More than half of infants who acquire HIV are born to women who either never started antiretroviral treatment or stopped it. Almost none are born to women who were on treatment and stayed on it.

So this programme is built entirely around the second thing. Testing a pregnant woman is the easy part; keeping her in care for the next two years is the work.

## What we do

- Support every pregnant woman who tests positive to start treatment the same day, and go with her to the facility if she wants company.
- Follow up through pregnancy, delivery, and the full breastfeeding period — the point at which most programmes stop paying attention and transmission still happens.
- Ensure infants are tested at six weeks and again after breastfeeding ends, and are traced if they miss it.
- Trace and re-engage mothers who miss appointments, quietly and without disclosing anything to anyone in her household.
- Support disclosure to a partner only where the woman wants it and only where it is safe. Where a risk assessment suggests it is not, we do not proceed.

## Beyond the clinic

A woman who cannot feed her family will not prioritise a clinic appointment, and telling her to is useless. Mothers in this programme are linked to our livelihoods and savings work, because economic stability is what makes staying in care possible.

We report the proportion of mother–infant pairs still in care at eighteen months, and the proportion of exposed infants with a documented final HIV status. Those two numbers describe whether this programme works. The number of women tested does not.`,
    icon: "Baby",
    cover_image: "/programs/emtct.jpg",
    accent: "navy",
    status: "published",
    sort_order: 6,
    people_reached: 0,
  },
  {
    id: 7,
    slug: "srh-teen-pregnancy",
    title: "Sexual & Reproductive Health · Ending Early Pregnancy",
    summary:
      "Over 232,000 Kenyan girls became pregnant last year. We work on the reasons why — information, contraception access, and keeping girls in school.",
    body: `More than 232,000 girls in Kenya became pregnant in 2025, including over 11,000 aged between ten and fourteen. Junior school learners account for around 60% of reported cases. In some counties the rate exceeds one girl in three.

A pregnancy at fourteen ends a girl's education, raises her lifetime risk of poverty, and sharply increases her risk of HIV. It is also, almost always, preventable.

## Information, before it is needed

Age-appropriate sexual and reproductive health education delivered through our safe spaces and school partnerships. Not abstinence lectures — accurate information about bodies, consent, contraception and where to get help, given before a girl needs it rather than after.

We run a separate session for boys in the same schools. A programme that speaks only to girls asks them to carry the whole responsibility for something that takes two people.

## Access, not just awareness

Knowing that contraception exists changes nothing if a girl cannot get it without being shamed at the counter. We refer to youth-friendly services at partner facilities, and we work with those facilities on how adolescents are actually received when they walk in.

## Staying in school

Kenyan policy allows girls to return to school after giving birth. Whether that actually happens depends on the school, the family and the childcare. We work with head teachers on re-entry, and support young mothers to return.

## What drives it

We do not pretend this is only about information. Poverty, transactional sex, early marriage and sexual violence drive a large share of these pregnancies — which is why this programme is run alongside our GBV and livelihoods work rather than separately from it.`,
    icon: "Sparkles",
    cover_image: "/programs/srh-teen-pregnancy.jpg",
    accent: "teal",
    status: "published",
    sort_order: 7,
    people_reached: 0,
  },
  {
    id: 8,
    slug: "otz",
    title: "Operation Triple Zero (OTZ)",
    summary:
      "Peer-led clubs for adolescents and young people living with HIV, built on three commitments: zero missed appointments, zero missed doses, zero viral load.",
    body: `Adolescents and young people living with HIV have the worst treatment outcomes of any age group in Kenya — the highest loss to follow-up, the lowest adherence, and the lowest rates of viral suppression. Not because the medicine works less well at fifteen, but because being fifteen and taking daily medication you cannot explain to your friends is genuinely hard.

Operation Triple Zero is a Ministry of Health model, first implemented in Kenya in 2017, that treats young people as managers of their own health rather than as patients who need reminding.

## The three zeroes

Members commit to three things, and hold each other to them:

- **Zero missed appointments** — turning up, every time.
- **Zero missed doses** — taking the medication, every day.
- **Zero viral load** — the outcome those two produce, and the one that means you cannot pass HIV on.

## Why it works

The clubs are peer-led. A young person who has been undetectable for two years is far more persuasive to a struggling fifteen-year-old than any clinician, and the format lets members say out loud the things they cannot say at home.

Members receive a full treatment literacy package — what the virus does, what the medication does, what a viral load result means. Young people adhere better when they understand what they are adhering to.

## The scheduling problem nobody mentions

Clinics run during school hours. So a teenager choosing between an appointment and a day of lessons will miss the appointment, and then be recorded as non-adherent.

We run weekend and after-school clinic sessions with partner facilities for exactly this reason. Where that has been done elsewhere in Kenya, attendance and viral suppression both rose sharply.

## What we report

The proportion of club members who are virally suppressed, and the proportion still in care twelve months after joining. Not attendance at club meetings.`,
    icon: "Target",
    cover_image: "/programs/otz.jpg",
    accent: "navy",
    status: "published",
    sort_order: 8,
    people_reached: 0,
  },
  {
    id: 9,
    slug: "disability-inclusion",
    title: "Health Services for People with Disabilities",
    summary:
      "People with disabilities face the same health risks as everyone else and far more obstacles reaching services. We have a team whose job is removing them.",
    body: `People with disabilities are as likely to need HIV testing, TB screening, cancer screening and GBV support as anyone else — and in several respects more likely, since disability raises the risk of sexual violence and of being excluded from prevention information entirely.

They are also far less likely to receive any of it. Kenya's Persons with Disabilities Act 2025 is among the strongest disability laws in Africa. The gap now is not the law; it is what happens at the clinic door.

## The obstacles are specific

- A Deaf client cannot have a confidential consultation through a family member interpreting. That is not confidentiality, and it stops people disclosing anything that matters.
- A wheelchair user cannot reach a first-floor clinic with no lift.
- A blind client cannot read a consent form, a medication label or an appointment card.
- Health information is almost never produced in accessible formats.
- Staff are rarely trained, and clients are often talked past rather than talked to.

## What our team does

We have a team dedicated to this, and their job is practical:

- Kenyan Sign Language interpretation at our outreach sessions and accompanied referrals, so nobody has to bring a relative to translate their own diagnosis.
- Health information in accessible formats, including audio and easy-read.
- Home-based testing and screening where a facility cannot physically be reached.
- Working with partner facilities on physical access, and training their staff on communicating directly with a disabled client rather than with whoever came with them.
- Accompanied referral for anyone who wants it.

## Nothing about us without us

The team includes people with disabilities. A programme designed for disabled people by non-disabled people gets the obstacles wrong — usually by fixing the visible ones and missing the ones that actually stop people.`,
    icon: "Accessibility",
    cover_image: "/programs/disability-inclusion.jpg",
    accent: "teal",
    status: "published",
    sort_order: 9,
    people_reached: 0,
  },
];

export const projects: Project[] = [
  {
    id: 1,
    slug: "pima-community-hiv-testing",
    title: "Pima Community HIV Testing",
    program_id: 1,
    summary:
      "Door-to-door and moonlight HIV testing across six wards, with same-day escorted linkage to care.",
    body: "Four testing teams operating six days a week, including evening and weekend coverage at venues where daytime outreach reaches nobody. Every reactive result is escorted to a partner facility the same day where the client consents.",
    cover_image: null,
    location: "Kisumu East & West",
    region: "Nyanza",
    status: "active",
    visibility: "published",
    beneficiaries: 8200,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2022-04-01",
    completed_on: "2027-03-31",
    funder: "Global Fund (Grant Cycle 7)",
    funder_url: null,
    target: "8,200 people reached annually across six wards",
    reporting_line: "Kisumu County Department of Health",
    counties: ["Kisumu", "Homa Bay", "Siaya", "Migori"],
    purpose:
      "To close the gap between an HIV test and sustained treatment, by delivering community-based testing where people already are and accompanying every reactive result to a facility the same day — working towards the 95-95-95 targets in four high-burden counties.",
    outcomes: [
      "Six-month retention in care above 90% for clients linked through our teams",
      "Same-day linkage for every client who consents to accompaniment",
      "Increased PrEP uptake among populations at substantial risk",
      "Strengthened county ownership of community testing, with handover by year five",
    ],
    target_populations: [
      "General population",
      "Key populations",
      "AGYW",
      "Men aged 25–39",
      "Partners of index clients",
    ],
    pillars: [
      {
        title: "Community HIV Testing",
        body: "Door-to-door, workplace and moonlight testing across six wards, including evening and weekend coverage for people who cannot lose a day's wages.",
      },
      {
        title: "Same-Day Linkage",
        body: "Every reactive result escorted to a partner facility the same day where the client consents, with follow-up at one week, one month and six months.",
      },
      {
        title: "Prevention & PrEP",
        body: "Condom and lubricant distribution, PrEP demand creation, and direct referral to facility PrEP clinics with three-month continuation follow-up.",
      },
      {
        title: "Health System Strengthening",
        body: "Joint planning with county health management teams, shared data systems, and a costed transition plan so the work survives the grant.",
      },
    ],
    implementing_partners: [
      { name: "Kisumu County Health Department", county: "Kisumu" },
      { name: "Homa Bay Community Health Network", county: "Homa Bay" },
      { name: "Siaya Faith Health Forum", county: "Siaya" },
    ],
  },
  {
    id: 2,
    slug: "kikohozi-tb-case-finding",
    title: "Kikohozi Active TB Case Finding",
    program_id: 2,
    summary:
      "Household and congregate-setting TB screening with sputum transport to partner diagnostic facilities.",
    body: "Screening at households of confirmed cases, in prisons and in informal settlements, with a same-day sputum courier to the county diagnostic laboratory and results returned within 72 hours.",
    cover_image: null,
    location: "Nairobi informal settlements",
    region: "Nairobi",
    status: "active",
    visibility: "published",
    beneficiaries: 5100,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2023-02-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 3,
    slug: "uzima-cervical-screening",
    title: "Uzima Cervical Cancer Screening Days",
    program_id: 3,
    summary:
      "Monthly screening days run with partner facilities, plus navigation for every woman who screens positive.",
    body: "Clinical screening is delivered by facility staff under their own protocols. UCC provides mobilisation, transport, refreshments and a navigator assigned to each positive result until treatment has begun.",
    cover_image: null,
    location: "Kilifi County",
    region: "Coast",
    status: "active",
    visibility: "published",
    beneficiaries: 3400,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2023-06-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 4,
    slug: "salama-gbv-safe-spaces",
    title: "Salama GBV Safe Spaces",
    program_id: 4,
    summary:
      "Six safe spaces offering first-line support, and an accompanied referral pathway to clinical, police and legal services.",
    body: "Staffed by trained psychosocial workers. Standing referral agreements with four designated post-rape care facilities, three police gender desks and two legal aid partners.",
    cover_image: null,
    location: "Nakuru County",
    region: "Rift Valley",
    status: "active",
    visibility: "published",
    beneficiaries: 2300,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2022-09-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 5,
    slug: "binti-hpv-vaccination",
    title: "Binti HPV Vaccination Drive",
    program_id: 5,
    summary:
      "Mobilisation and second-dose follow-up for HPV vaccination of girls aged 10 to 14 in 24 schools.",
    body: "Delivered with Ministry of Health vaccination teams. UCC handles parental consent conversations, transport and — critically — the second-dose follow-up where most programmes lose girls.",
    cover_image: null,
    location: "Machakos County",
    region: "Eastern",
    status: "active",
    visibility: "published",
    beneficiaries: 4600,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2024-01-15",
    completed_on: "2027-01-14",
    funder: "Ministry of Health — National Vaccines Programme",
    funder_url: null,
    target: "4,600 girls across 24 schools, with 90% second-dose completion",
    reporting_line: "Machakos County Department of Health",
    counties: ["Machakos", "Makueni"],
    purpose:
      "To raise HPV vaccination coverage among girls aged 10 to 14, with particular attention to the second dose — the point at which most vaccination programmes lose girls and the one that confers protection.",
    outcomes: [
      "Second-dose completion above 90% among girls who receive a first dose",
      "Parental consent conversations completed before every school session",
      "Reduced long-term cervical cancer risk in the covered cohort",
    ],
    target_populations: ["Girls aged 10–14", "Parents and guardians", "School staff"],
    pillars: [
      {
        title: "Demand Creation",
        body: "Community and school mobilisation, and consent conversations with parents and guardians before any session takes place.",
      },
      {
        title: "Vaccination Delivery",
        body: "Delivered by Ministry of Health vaccination teams under national protocols. UCC provides logistics, transport and session coordination.",
      },
      {
        title: "Second-Dose Follow-Up",
        body: "Tracing every girl who received a first dose across term breaks and school transfers, which is where coverage is usually lost.",
      },
    ],
    implementing_partners: [
      { name: "Machakos County Health Department", county: "Machakos" },
      { name: "Makueni Sub-County Health Team", county: "Makueni" },
    ],
  },
  {
    id: 6,
    slug: "pedi-reusable-pads",
    title: "Pedi Reusable Pad & Menstrual Health",
    program_id: 5,
    summary:
      "Reusable sanitary pad kits and menstrual health education for 6,200 girls across 38 schools.",
    body: "Each kit lasts up to three years. Distribution is paired with menstrual health education for girls and a separate session for boys in the same school.",
    cover_image: null,
    location: "Kakamega County",
    region: "Western",
    status: "active",
    visibility: "published",
    beneficiaries: 6200,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2023-05-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 7,
    slug: "prep-demand-creation",
    title: "PrEP Demand Creation & Referral",
    program_id: 1,
    summary:
      "Awareness and facility referral for pre-exposure prophylaxis among populations at substantial risk.",
    body: "Peer educators deliver PrEP information at community level and refer directly to facility PrEP clinics, with three-month continuation follow-up.",
    cover_image: null,
    location: "Mombasa County",
    region: "Coast",
    status: "active",
    visibility: "published",
    beneficiaries: 2900,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2024-03-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 8,
    slug: "tb-treatment-adherence",
    title: "TB Treatment Adherence Support",
    program_id: 2,
    summary:
      "Weekly treatment support through the full six-month course, with 48-hour tracing of missed appointments.",
    body: "Community treatment supporters maintain weekly contact, trace missed facility appointments within 48 hours and provide a transport stipend where cost is the barrier to completion.",
    cover_image: null,
    location: "Kiambu County",
    region: "Central",
    status: "active",
    visibility: "published",
    beneficiaries: 1400,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2023-09-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 9,
    slug: "wanaume-gbv-prevention",
    title: "Wanaume Male Engagement",
    program_id: 4,
    summary:
      "Community dialogues with men and boys on violence prevention, consent and respectful relationships.",
    body: "Facilitated dialogue series in 22 communities, led by trained male community facilitators, with follow-up sessions at three and six months.",
    cover_image: null,
    location: "Nakuru & Baringo",
    region: "Rift Valley",
    status: "active",
    visibility: "published",
    beneficiaries: 3100,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2024-02-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 10,
    slug: "breast-cancer-awareness",
    title: "Breast Cancer Awareness & Clinical Referral",
    program_id: 3,
    summary:
      "Community education on breast self-examination and referral for clinical breast examination.",
    body: "Delivered through existing women's groups and church networks, with a referral slip system to two partner facilities offering clinical examination and onward diagnostic imaging.",
    cover_image: null,
    location: "Meru County",
    region: "Eastern",
    status: "active",
    visibility: "published",
    beneficiaries: 2700,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2024-06-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 11,
    slug: "index-testing-linkage",
    title: "Index Testing & Family Linkage",
    program_id: 1,
    summary:
      "Voluntary partner and family testing offered alongside every new HIV diagnosis, with strict consent safeguards.",
    body: "Offered, never pressured, and never proceeded with where a risk assessment identifies possible intimate partner violence. Declining has no effect on the client's own care.",
    cover_image: null,
    location: "Homa Bay County",
    region: "Nyanza",
    status: "active",
    visibility: "published",
    beneficiaries: 1900,
    budget_cents: 0,
    raised_cents: 0,
    started_on: "2024-04-01",
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
  {
    id: 12,
    slug: "shule-safe-spaces",
    title: "Shule Safe Spaces for Girls",
    program_id: 5,
    summary:
      "Weekly mentor-led sessions for adolescent girls on health, consent and HIV prevention in 30 schools.",
    body: "Sessions are led by mentors only a few years older than the participants — the design choice that most affects whether girls speak openly.",
    cover_image: null,
    location: "Siaya County",
    region: "Nyanza",
    status: "planned",
    visibility: "published",
    beneficiaries: 2400,
    budget_cents: 0,
    raised_cents: 0,
    started_on: null,
    completed_on: null,
    funder: "",
    funder_url: null,
    target: "",
    reporting_line: "",
    counties: [],
    purpose: "",
    outcomes: [],
    target_populations: [],
    pillars: [],
    implementing_partners: [],
  },
];

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

export const posts: Post[] = [
  {
    id: 1,
    slug: "annual-report-2025-published",
    title: "Our 2025 annual report is published — including what did not work",
    excerpt:
      "Audited accounts, programme results, and a full page on the three things we got wrong this year.",
    body: `Every year we publish an audited annual report. Every year it includes a section titled "What did not work", and every year it is the section our board argues about most.

This year it covers three things: a six-month linkage-to-care rate that fell to 81% when we lost two linkage officers, a cervical cancer screening day that turned away 60 women because we under-staffed it, and an HPV second-dose follow-up rate of 68% that is simply not good enough.

## Why publish it

Because the alternative is a report only a fool would believe. Any organisation working in HIV, TB and GBV with limited money will have failures. An annual report without them is not evidence of a flawless year — it is evidence of a document written for donors rather than for the communities we serve.

## The numbers

Total income for the year was KES 61.4 million. Of every 100 shillings, 83 reached programme activity, 10 went to administration and 7 to fundraising. The full audited accounts, the auditor's letter and the trustees' report are all in the PDF.`,
    kind: "report",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Grace Wanjiku",
    program_id: null,
    status: "published",
    featured: true,
    reading_mins: 4,
    published_at: iso(6),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 2,
    slug: "12000-hiv-tests-linkage-rate",
    title: "12,400 HIV tests this year — and why we report the linkage rate instead",
    excerpt:
      "A test result changes nothing on its own. The number that matters is how many people were still in care six months later.",
    body: `We conducted 12,400 HIV tests in the last financial year. It is the number donors ask for and the least useful number we hold.

A test is not a health outcome. The outcome is a person living with HIV who is in treatment, virally suppressed, and still in care a year later. So the figure we lead with is different: of clients who tested positive through our teams, 88% were still in care at six months.

## Why the gap exists

The 12% who are not still in care did not mostly refuse treatment. They moved for work, they could not afford the transport, they were afraid a family member would find their clinic card, or they felt well and stopped. Each of those has a different fix, and lumping them together as "defaulters" prevents you finding any of them.`,
    kind: "report",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Dr Faith Mutiso",
    program_id: 1,
    status: "published",
    featured: true,
    reading_mins: 5,
    published_at: iso(13),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 3,
    slug: "reusable-pads-attendance",
    title: "6,200 girls received reusable pad kits. School attendance is the point.",
    excerpt:
      "A kit that lasts three years removes a monthly cost — and a monthly reason to stay home.",
    body: `We distributed 6,200 reusable sanitary pad kits across 38 schools this year, paired with menstrual health education.

Reusable rather than disposable is deliberate. A kit lasts up to three years, which removes the recurring cost that keeps girls at home in the first place, and it does not create a supply dependency we cannot sustain past the end of a grant.

## The session for boys

Every distribution is paired with a separate session for boys in the same school. Ridicule is as much a reason for missed school days as the absence of a pad, and a programme that addresses only one of those is doing half the work.`,
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Mercy Achieng",
    program_id: 5,
    status: "published",
    featured: true,
    reading_mins: 3,
    published_at: iso(20),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 4,
    slug: "hpv-vaccination-second-dose",
    title: "The HPV second dose is where vaccination programmes fail",
    excerpt:
      "First-dose coverage looks good almost everywhere. We report the second, because that is the one that protects.",
    body: "Mobilising girls for a first HPV dose is comparatively easy. Bringing the same girl back months later, after her school term has changed and her family has moved on, is the actual work — and it is where coverage collapses.",
    kind: "story",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Dr Faith Mutiso",
    program_id: 5,
    status: "published",
    featured: false,
    reading_mins: 4,
    published_at: iso(27),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 5,
    slug: "gbv-referral-pathway-agreement",
    title: "New GBV referral agreements with four post-rape care facilities",
    excerpt:
      "Standing agreements mean a survivor is expected at the facility, not explaining themselves at a reception desk.",
    body: "The agreements cover designated post-rape care services at four facilities, three police gender desks and two legal aid partners. A survivor who chooses to be referred is accompanied, and is expected on arrival.",
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Esther Nafula",
    program_id: 4,
    status: "published",
    featured: false,
    reading_mins: 2,
    published_at: iso(34),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 6,
    slug: "72-hours-post-exposure-prophylaxis",
    title: "72 hours: the single fact we repeat everywhere",
    excerpt:
      "Post-exposure prophylaxis prevents HIV transmission after sexual violence — but only if it starts in time.",
    body: "PEP must begin within 72 hours of exposure, and emergency contraception within 120. Getting that one fact into a community is among the highest-value things this organisation does, so we repeat it in every safe space, every AGYW session and on radio.",
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Esther Nafula",
    program_id: 4,
    status: "published",
    featured: false,
    reading_mins: 2,
    published_at: iso(41),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 7,
    slug: "tb-treatment-completion-rate",
    title: "TB treatment completion reached 91%. Initiation was never the problem.",
    excerpt:
      "People stop TB treatment when they start feeling better, which is roughly halfway through.",
    body: "Of clients supported through the full six-month course, 91% completed treatment. Weekly contact and 48-hour tracing of missed appointments account for most of that figure.",
    kind: "report",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Daniel Kiptoo",
    program_id: 2,
    status: "published",
    featured: false,
    reading_mins: 4,
    published_at: iso(48),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 8,
    slug: "cervical-screening-navigation",
    title: "Screening without navigation is a statistic, not a service",
    excerpt:
      "A positive screen result is the point at which most women are lost. So we assign someone.",
    body: "Every woman who screens positive at one of our screening days is assigned a navigator who books the follow-up appointment, arranges transport and stays in contact until treatment has begun.",
    kind: "story",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Dr Faith Mutiso",
    program_id: 3,
    status: "published",
    featured: false,
    reading_mins: 4,
    published_at: iso(55),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 9,
    slug: "safeguarding-policy-update",
    title: "We have updated our safeguarding and confidentiality policy",
    excerpt:
      "Clearer reporting routes, an external channel independent of management, and mandatory annual training for everyone including trustees.",
    body: "The revised policy adds an external reporting channel independent of UCC management, and makes annual safeguarding and confidentiality training mandatory for all staff, volunteers and trustees without exception.",
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Grace Wanjiku",
    program_id: null,
    status: "published",
    featured: false,
    reading_mins: 3,
    published_at: iso(62),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 10,
    slug: "moonlight-testing-reach",
    title: "Why we test at night",
    excerpt:
      "Daytime outreach reaches the people who can afford to take a day off. Moonlight testing reaches everyone else.",
    body: "Evening and late-night testing at venues and hotspots reaches populations at substantial risk who never appear at a daytime clinic — because attending one costs them a day's income.",
    kind: "story",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Daniel Kiptoo",
    program_id: 1,
    status: "published",
    featured: false,
    reading_mins: 3,
    published_at: iso(70),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 11,
    slug: "male-engagement-dialogues",
    title: "22 communities, and a conversation men had not been invited into",
    excerpt: "GBV prevention that speaks only to women asks the wrong people to fix it.",
    body: "Facilitated dialogue series with men and boys in 22 communities, led by trained male facilitators, with follow-up at three and six months.",
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Esther Nafula",
    program_id: 4,
    status: "published",
    featured: false,
    reading_mins: 3,
    published_at: iso(78),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 12,
    slug: "index-testing-consent-safeguards",
    title: "Index testing works. It also carries a risk we take seriously.",
    excerpt:
      "Offering to test a client's partner can expose that client to violence. Here is how we handle it.",
    body: "Index testing is offered, never pressured, and never proceeded with where a risk assessment identifies possible intimate partner violence. Declining has no effect whatsoever on the client's own care.",
    kind: "story",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Dr Faith Mutiso",
    program_id: 1,
    status: "published",
    featured: false,
    reading_mins: 5,
    published_at: iso(87),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 13,
    slug: "referral-partners-2025",
    title: "Who we refer to, and why we publish the list",
    excerpt:
      "We are not a clinical service. Everything we do ends at somebody else's door, so you should know whose.",
    body: "Our standing referral agreements cover county health facilities, partner NGOs and government services. Publishing the list lets a community verify that the door we send them to is real.",
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Grace Wanjiku",
    program_id: null,
    status: "published",
    featured: false,
    reading_mins: 3,
    published_at: iso(96),
    seo_title: null,
    seo_desc: null,
  },
  {
    id: 14,
    slug: "board-appoints-two-trustees",
    title: "Board appoints two new trustees",
    excerpt: "Both bring community-side experience, and both live in counties where we work.",
    body: "The board has appointed two new trustees following an open recruitment. Trustee terms are four years, renewable once, and all appointments are published here.",
    kind: "news",
    cover_image: null,
    cover_alt: "",
    author_id: null,
    author_name: "Grace Wanjiku",
    program_id: null,
    status: "published",
    featured: false,
    reading_mins: 2,
    published_at: iso(110),
    seo_title: null,
    seo_desc: null,
  },
];

export const events: EventItem[] = [
  {
    id: 1,
    slug: "world-aids-day-testing-drive",
    title: "World AIDS Day Community Testing Drive",
    summary:
      "Free, confidential HIV testing at eight community sites, with same-day linkage to care.",
    body: "Testing is free, confidential and open to everyone. No appointment, no identification required. Counsellors available in English, Kiswahili and Dholuo.",
    cover_image: null,
    venue: "Eight community sites",
    location: "Kisumu County",
    starts_at: new Date(Date.now() + 12 * 86_400_000).toISOString(),
    ends_at: null,
    capacity: 0,
    status: "published",
  },
  {
    id: 2,
    slug: "cervical-screening-day-kilifi",
    title: "Cervical & Breast Cancer Screening Day",
    summary:
      "Free screening with partner facility clinical staff. Navigation support for anyone who screens positive.",
    body: "Screening is delivered by qualified facility clinicians under their own protocols. Transport is provided from four collection points.",
    cover_image: null,
    venue: "Kilifi County Referral Hospital",
    location: "Kilifi",
    starts_at: new Date(Date.now() + 26 * 86_400_000).toISOString(),
    ends_at: null,
    capacity: 250,
    status: "published",
  },
  {
    id: 3,
    slug: "16-days-of-activism-gbv",
    title: "16 Days of Activism Against Gender-Based Violence",
    summary: "Community dialogues, school sessions and a survivor services information point.",
    body: "Sixteen days of community dialogue, school-based sessions on consent, and a staffed information point on available clinical, police and legal services.",
    cover_image: null,
    venue: "Multiple community venues",
    location: "Nakuru County",
    starts_at: new Date(Date.now() + 40 * 86_400_000).toISOString(),
    ends_at: new Date(Date.now() + 56 * 86_400_000).toISOString(),
    capacity: 0,
    status: "published",
  },
  {
    id: 4,
    slug: "annual-community-review-2026",
    title: "Annual Community Review Meeting",
    summary:
      "Our accounts and results, presented in person to the communities we work in. Open to all.",
    body: "The audited accounts are read out, programme results are presented, and the floor is open to questions for as long as there are questions.",
    cover_image: null,
    venue: "Kilifi Community Hall",
    location: "Kilifi",
    starts_at: new Date(Date.now() + 74 * 86_400_000).toISOString(),
    ends_at: null,
    capacity: 300,
    status: "published",
  },
];

export const team: TeamMember[] = [
  {
    id: 1,
    name: "Grace Wanjiku",
    role_title: "Executive Director",
    bio: "Founded UCC in 2016 after twelve years in community HIV programming. Chairs the safeguarding committee.",
    photo_url: null,
    group_name: "leadership",
    linkedin: null,
    email: null,
    sort_order: 1,
    is_published: true,
  },
  {
    id: 2,
    name: "Dr Faith Mutiso",
    role_title: "Director of Health Programmes",
    bio: "Public health physician. Leads HIV, TB and cancer screening work and holds clinical oversight of all referral pathways.",
    photo_url: null,
    group_name: "leadership",
    linkedin: null,
    email: null,
    sort_order: 2,
    is_published: true,
  },
  {
    id: 3,
    name: "Esther Nafula",
    role_title: "Head of GBV & Protection",
    bio: "Social worker with fifteen years in survivor-centred practice. Responsible for case management standards and staff supervision.",
    photo_url: null,
    group_name: "leadership",
    linkedin: null,
    email: null,
    sort_order: 3,
    is_published: true,
  },
  {
    id: 4,
    name: "Mercy Achieng",
    role_title: "Head of AGYW Programmes",
    bio: "Leads adolescent girls and young women's work, including HPV vaccination mobilisation and menstrual health.",
    photo_url: null,
    group_name: "leadership",
    linkedin: null,
    email: null,
    sort_order: 4,
    is_published: true,
  },
  {
    id: 5,
    name: "Daniel Kiptoo",
    role_title: "Head of Community Outreach",
    bio: "Manages the community testing and TB case-finding teams across all counties of operation.",
    photo_url: null,
    group_name: "leadership",
    linkedin: null,
    email: null,
    sort_order: 5,
    is_published: true,
  },
  {
    id: 6,
    name: "Samuel Odhiambo",
    role_title: "Finance & Compliance Manager",
    bio: "Certified public accountant. Responsible for the audit, statutory filings and donor reporting.",
    photo_url: null,
    group_name: "leadership",
    linkedin: null,
    email: null,
    sort_order: 6,
    is_published: true,
  },
  {
    id: 7,
    name: "Prof. Alice Njeri",
    role_title: "Chair of the Board",
    bio: "Professor of public health. Trustee since 2017, chair since 2021.",
    photo_url: null,
    group_name: "board",
    linkedin: null,
    email: null,
    sort_order: 1,
    is_published: true,
  },
  {
    id: 8,
    name: "James Mwangi",
    role_title: "Trustee, Treasurer",
    bio: "Chartered accountant. Chairs the finance and audit committee.",
    photo_url: null,
    group_name: "board",
    linkedin: null,
    email: null,
    sort_order: 2,
    is_published: true,
  },
  {
    id: 9,
    name: "Halima Yusuf",
    role_title: "Trustee",
    bio: "Community organiser. Appointed to bring community-side scrutiny to the board.",
    photo_url: null,
    group_name: "board",
    linkedin: null,
    email: null,
    sort_order: 3,
    is_published: true,
  },
  {
    id: 10,
    name: "Peter Kamau",
    role_title: "Trustee",
    bio: "Lawyer specialising in health law, safeguarding and charity governance.",
    photo_url: null,
    group_name: "board",
    linkedin: null,
    email: null,
    sort_order: 4,
    is_published: true,
  },
];

/**
 * Referral partners, published so a community can verify the door.
 *
 * Two rules govern this list, and both exist because the page makes a checkable
 * claim rather than a decorative one:
 *
 *   `website` is the organisation's own official domain, or null. A guessed or
 *   dead link on this particular wall would undo the reason for publishing it.
 *
 *   `logo_url` points at a real file the partner supplied, or null — in which
 *   case the UI draws a monogram from their initials. We never approximate a
 *   partner's mark, and for a ministry or county emblem that would be forgery.
 *   See public/partners/README.md for how to add the real files.
 */
export const partners: Partner[] = [
  { id: 1, name: "Ministry of Health", logo_url: null, website: "https://www.health.go.ke", tier: "implementing", blurb: "HPV vaccination services and national health protocols.", sort_order: 1 },
  { id: 2, name: "County Government of Kisumu", logo_url: "/partners/kisumu-county.png", website: "https://www.kisumu.go.ke", tier: "implementing", blurb: "Joint HIV testing services and facility linkage.", sort_order: 2 },
  { id: 3, name: "Kilifi County Referral Hospital", logo_url: null, website: "https://kilifi.go.ke", tier: "implementing", blurb: "Cervical and breast cancer screening, and onward treatment.", sort_order: 3 },
  { id: 4, name: "National TB Programme", logo_url: null, website: "https://nltp.co.ke", tier: "implementing", blurb: "Diagnostic services and treatment protocols.", sort_order: 4 },
  { id: 5, name: "Stawisha Care", logo_url: null, website: "https://stawishacare.org", tier: "partner", blurb: "Online HIV prevention, TB and wider health services. Where we are not operating near you, they can help directly.", sort_order: 5 },
  { id: 9, name: "Gender Violence Recovery Centre", logo_url: null, website: "https://gvrc.or.ke", tier: "partner", blurb: "Post-rape care referral partner.", sort_order: 9 },
  { id: 6, name: "Kenya Legal Aid Network", logo_url: null, website: null, tier: "partner", blurb: "Legal representation for GBV survivors who choose to pursue a case.", sort_order: 6 },
  { id: 7, name: "Global Health Fund", logo_url: null, website: null, tier: "funder", blurb: "Core funder of HIV and TB programming since 2019.", sort_order: 7 },
  { id: 8, name: "Alvania Group", logo_url: null, website: "https://alvaniagroup.com", tier: "partner", blurb: "Pro bono technology partner. Builds and maintains our digital systems.", sort_order: 8 },
];

/**
 * Deliberately empty. Impact statistics are published claims about programme
 * results — they belong in the `impact_stats` table, entered from the admin by
 * someone holding `content:edit`, and traceable to your M&E data or audit.
 *
 * While this is empty the site simply does not show an impact section, which
 * is the correct behaviour: no figures is honest, invented figures are not.
 */
export const impactStats: ImpactStat[] = [];

/**
 * Deliberately empty. Published spending figures are audited financial
 * statements, not website copy — they belong in the `finance_lines` table,
 * entered from the admin by someone holding `content:edit`, and traceable line
 * by line to the audited accounts for that year.
 *
 * While this is empty the transparency page shows the organisation's
 * accountability *commitments* — how the accounts are prepared, who audits
 * them, how to obtain them and how to complain — which are all verifiable by
 * inspection. It shows no numbers at all, which is the honest state for an
 * organisation that has not yet published a set.
 */
export const financeLines: FinanceLine[] = [];

/** Sample vacancies. Replace with real ones posted through the admin. */
export const jobOpenings: JobOpening[] = [
  {
    id: 1,
    slug: "community-linkage-officer-kisumu",
    title: "Community Linkage Officer",
    summary:
      "Accompany clients who test positive for HIV to a partner facility, and follow them up until they are settled in care.",
    description:
      "This is the role that decides whether our HIV programme works. Testing someone is straightforward; making sure they are still in treatment six months later is the actual job, and it is yours.\n\nYou will work with a testing team across six wards in Kisumu East and West, including evening and weekend outreach.",
    responsibilities:
      "- Accompany clients to partner facilities on the day of a reactive result, where they consent to it\n- Follow up every linked client at one week, one month, three months and six months\n- Trace clients who miss facility appointments, discreetly and without disclosing anything to anyone else\n- Keep accurate, confidential records and report weekly on the six-month retention figure\n- Work evenings and weekends on a rota",
    requirements:
      "- Diploma in social work, community health, counselling or a related field\n- At least two years working directly with clients in HIV, TB or a comparable programme\n- HIV testing services certification, or willingness to complete it\n- Fluent Dholuo and Kiswahili\n- Absolute discretion. Most of what you learn in this job is not yours to repeat\n- Satisfactory background check and safeguarding induction before starting",
    department: "HIV Prevention",
    location: "Kisumu",
    employment_type: "full_time",
    salary_range: "KES 55,000 – 70,000 per month",
    closes_on: new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10),
    status: "open",
    published_at: new Date(Date.now() - 4 * 86_400_000).toISOString(),
  },
  {
    id: 2,
    slug: "agyw-mentor-kakamega",
    title: "AGYW Safe Space Mentor",
    summary:
      "Lead weekly safe-space sessions for adolescent girls on health, consent and HIV prevention.",
    description:
      "Our safe spaces work because they are led by mentors only a few years older than the participants. That single design choice is what decides whether girls speak openly or sit in silence.\n\nYou will run weekly sessions across schools in Kakamega County, alongside reusable pad distribution and menstrual health education.",
    responsibilities:
      "- Facilitate weekly safe-space sessions for groups of 15 to 25 girls\n- Deliver menstrual health education, and the paired session for boys in the same school\n- Identify girls who may need clinical or protection referral, and refer them correctly\n- Report attendance and session outcomes monthly",
    requirements:
      "- Aged 20 to 26, and comfortable being a role model to girls not much younger\n- Certificate or diploma in a health, education or social field\n- Experience facilitating groups of young people\n- Fluent Luhya and Kiswahili\n- Satisfactory background check and safeguarding induction before starting",
    department: "Adolescent Girls & Young Women",
    location: "Kakamega",
    employment_type: "full_time",
    salary_range: "KES 42,000 – 52,000 per month",
    closes_on: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
    status: "open",
    published_at: new Date(Date.now() - 9 * 86_400_000).toISOString(),
  },
  {
    id: 3,
    slug: "monitoring-evaluation-officer",
    title: "Monitoring & Evaluation Officer",
    summary:
      "Own the numbers we publish — including the ones that do not flatter us.",
    description:
      "We report six-month retention rather than tests performed, and we publish a section every year on what did not work. Somebody has to make those numbers honest and defensible. That is this role.\n\nBased in Nanyuki with regular travel to the counties where we operate.",
    responsibilities:
      "- Maintain programme indicators across all five programmes\n- Verify data at source rather than accepting field returns at face value\n- Produce quarterly performance reports for management and the board\n- Lead the data sections of the annual report, including the failures\n- Train field staff in accurate, confidential record-keeping",
    requirements:
      "- Degree in statistics, public health, development studies or similar\n- Three years in an M&E role, ideally in HIV or TB programming\n- Confident with DHIS2 and spreadsheet analysis\n- Willing to tell senior staff that a number they like is wrong\n- Satisfactory background check",
    department: "Programmes",
    location: "Nanyuki, with travel",
    employment_type: "full_time",
    salary_range: "KES 90,000 – 115,000 per month",
    closes_on: new Date(Date.now() + 28 * 86_400_000).toISOString().slice(0, 10),
    status: "open",
    published_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: 4,
    slug: "gbv-psychosocial-counsellor",
    title: "GBV Psychosocial Counsellor",
    summary:
      "First-line support for survivors, and accompanied referral to clinical, police and legal services.",
    description:
      "Survivor-centred, without exception. The survivor decides what happens next — not you, not their family, not a well-meaning volunteer. Your job is to make sure every option is understood and any of them can be declined.",
    responsibilities:
      "- Provide first-line psychosocial support at our safe spaces\n- Explain clinical, police and legal options clearly, including the 72-hour PEP window\n- Accompany survivors to referral appointments where they want company\n- Maintain case records under our confidentiality policy\n- Attend clinical supervision monthly",
    requirements:
      "- Degree or higher diploma in counselling psychology or social work\n- At least three years in survivor-centred GBV practice\n- Trained in psychological first aid\n- Understanding of Kenyan mandatory reporting duties where a child is at risk\n- Satisfactory background check and safeguarding induction before starting",
    department: "GBV & Protection",
    location: "Nakuru",
    employment_type: "full_time",
    salary_range: "KES 75,000 – 95,000 per month",
    closes_on: new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10),
    status: "open",
    published_at: new Date(Date.now() - 16 * 86_400_000).toISOString(),
  },
  {
    id: 5,
    slug: "finance-intern",
    title: "Finance Intern",
    summary: "Six-month placement supporting the finance and compliance function.",
    description:
      "A genuine placement with real responsibility, supervision and a reference at the end. Not photocopying.",
    responsibilities:
      "- Support monthly reconciliations and donation record-keeping\n- Help prepare documentation for the annual audit\n- Assist with donor financial reporting",
    requirements:
      "- Studying towards or recently completed a degree in finance, accounting or economics\n- CPA part 1 an advantage\n- Careful with detail and comfortable saying when something does not add up",
    department: "Finance",
    location: "Nanyuki",
    employment_type: "internship",
    salary_range: "KES 25,000 per month stipend",
    closes_on: new Date(Date.now() + 35 * 86_400_000).toISOString().slice(0, 10),
    status: "open",
    published_at: new Date(Date.now() - 6 * 86_400_000).toISOString(),
  },
];
