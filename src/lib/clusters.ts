/**
 * Programme clusters.
 *
 * Nine programmes is too many to present as a flat list — a visitor cannot
 * hold that many distinctions at once, and the relationships between them get
 * lost. CHAK and Ciheb both group their work this way for the same reason.
 *
 * The grouping is not cosmetic. It reflects how the work is actually
 * delivered: one household visit screens for HIV and TB, refers a pregnant
 * woman into eMTCT, and enrols a positive teenager into OTZ. Those four
 * belong together because a single field team does all of them.
 *
 * Clusters are keyed on programme slug, so a programme that is unpublished or
 * renamed simply drops out — there is no second list to keep in step.
 */

export interface Cluster {
  slug: string;
  title: string;
  /** Short label used in filters and breadcrumbs. */
  shortTitle: string;
  lead: string;
  /** Programme slugs, in the order they should appear. */
  programs: string[];
  accent: "navy" | "azure";
}

export const clusters: Cluster[] = [
  {
    slug: "hiv-tb",
    title: "HIV & TB",
    shortTitle: "HIV & TB",
    lead: "Testing, treatment and the follow-up that decides whether either works. These four run as one pathway because a single field team delivers all of them — one household visit screens for HIV and TB, refers a pregnant woman into eMTCT, and enrols a positive teenager into OTZ.",
    programs: ["hiv-prevention", "tb-prevention", "emtct", "otz"],
    accent: "navy",
  },
  {
    slug: "adolescents",
    title: "Adolescents & Young People",
    shortTitle: "Adolescents",
    lead: "Adolescent girls and young women carry a disproportionate share of new HIV infections, of gender-based violence, and of the cervical cancer burden that begins with an HPV infection acquired in their teens. The interventions that change all three overlap almost completely.",
    programs: ["agyw-health", "srh-teen-pregnancy"],
    accent: "azure",
  },
  {
    slug: "protection",
    title: "Protection & Gender",
    shortTitle: "Protection",
    lead: "Survivor-centred support and the prevention work that reduces how often it is needed. This carries a duty of care no other programme here does: a mistake does not waste money, it puts someone in danger.",
    programs: ["gbv-response"],
    accent: "navy",
  },
  {
    slug: "cancer-inclusion",
    title: "Cancer Screening & Inclusion",
    shortTitle: "Cancer & Inclusion",
    lead: "Reaching the people that health systems most reliably miss — women who never get screened, and people with disabilities who cannot get through the clinic door at all.",
    programs: ["cancer-awareness", "disability-inclusion"],
    accent: "azure",
  },
];

/** The cluster a programme belongs to, or null if it is not yet assigned. */
export function clusterFor(programSlug: string): Cluster | null {
  return clusters.find((c) => c.programs.includes(programSlug)) ?? null;
}
