/**
 * Domain types shared by the repository layer, the pages and the admin.
 * These mirror the Supabase schema in supabase/migrations/0001_init.sql.
 */

export type ContentStatus = "draft" | "published" | "archived";
export type PostKind = "news" | "story" | "report";
export type ProjectStatus = "planned" | "active" | "completed";

export interface Program {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  cover_image: string | null;
  accent: string;
  status: ContentStatus;
  sort_order: number;
  people_reached: number;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  program_id: number | null;
  summary: string;
  body: string;
  cover_image: string | null;
  location: string;
  region: string;
  status: ProjectStatus;
  visibility: ContentStatus;
  beneficiaries: number;
  budget_cents: number;
  raised_cents: number;
  started_on: string | null;
  completed_on: string | null;
  /** Publicly named funder. Empty when not recorded — never invented. */
  funder: string;
  funder_url: string | null;
  /** What the project committed to deliver, traceable to a grant or workplan. */
  target: string;
  reporting_line: string;
  /** Counties of operation. Drives the public filter and the county count. */
  counties: string[];
  purpose: string;
  outcomes: string[];
  target_populations: string[];
  /** Distinct workstreams under one grant. */
  pillars: { title: string; body: string }[];
  /** Local organisations delivering on the ground. */
  implementing_partners: { name: string; county: string }[];
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  kind: PostKind;
  cover_image: string | null;
  cover_alt: string;
  author_id: string | null;
  author_name?: string;
  program_id: number | null;
  status: ContentStatus;
  featured: boolean;
  reading_mins: number;
  published_at: string | null;
  seo_title: string | null;
  seo_desc: string | null;
}

export interface EventItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  cover_image: string | null;
  venue: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  status: ContentStatus;
}

export interface TeamMember {
  id: number;
  name: string;
  role_title: string;
  bio: string;
  photo_url: string | null;
  group_name: "board" | "leadership" | "staff";
  linkedin: string | null;
  email: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  tier: "funder" | "partner" | "implementing";
  blurb: string;
  sort_order: number;
}

export interface ImpactStat {
  id: number;
  label: string;
  value: number;
  suffix: string;
  note: string;
  icon: string;
  sort_order: number;
  year: number | null;
}

export interface FinanceLine {
  id: number;
  year: number;
  category: "programmes" | "admin" | "fundraising";
  label: string;
  amount_cents: number;
  sort_order: number;
}

export interface Donation {
  id: number;
  reference: string;
  donor_name: string;
  donor_email: string;
  user_id: string | null;
  project_id: number | null;
  amount_cents: number;
  currency: string;
  frequency: "one_off" | "monthly";
  method: "mpesa" | "card" | "bank" | "cash";
  status: "pending" | "completed" | "failed" | "refunded";
  is_anonymous: boolean;
  message: string;
  created_at: string;
}

export interface VolunteerApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  motivation: string;
  program_id: number | null;
  status: "new" | "reviewing" | "accepted" | "declined";
  notes: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  topic: string;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  label: string;
  description: string;
  rank: number;
  is_system: boolean;
  permissions?: string[];
  user_count?: number;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role_id: number;
  role_name?: string;
  role_label?: string;
  role_rank?: number;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  phone: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  actor_id: string | null;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  detail: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}

export interface JobOpening {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  department: string;
  location: string;
  employment_type: "full_time" | "part_time" | "contract" | "volunteer" | "internship";
  salary_range: string;
  closes_on: string | null;
  status: "draft" | "open" | "closed" | "filled";
  published_at: string | null;
}

export interface JobApplication {
  id: number;
  reference: string;
  job_id: number;
  job_title?: string;
  name: string;
  email: string;
  phone: string;
  cover_letter: string;
  cv_url: string | null;
  years_experience: number;
  safeguarding_ack: boolean;
  status: "received" | "shortlisted" | "interviewing" | "offered" | "rejected" | "withdrawn";
  notes: string;
  created_at: string;
}

export interface HrRequest {
  id: number;
  reference: string;
  requester_name: string;
  requester_email: string;
  category: "leave" | "grievance" | "reference" | "policy" | "payroll" | "equipment" | "general";
  subject: string;
  details: string;
  confidential: boolean;
  status: "open" | "in_progress" | "resolved" | "declined";
  response: string;
  created_at: string;
}

export interface HealthIndicator {
  id: number;
  category: "prevalence" | "prevention" | "treatment" | "screening" | "coverage";
  label: string;
  segment: string;
  value: number;
  unit: "percent" | "count" | "rate";
  period: string;
  year: number | null;
  /** Required before publication — an unattributed health figure is worse than none. */
  source: string;
  source_url: string | null;
  /** Which direction counts as improvement. */
  better: "lower" | "higher";
  baseline_value: number | null;
  baseline_period: string;
  county: string;
  sort_order: number;
  is_published: boolean;
}
