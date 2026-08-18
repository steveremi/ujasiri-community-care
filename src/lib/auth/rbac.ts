/**
 * Role-based access control.
 *
 * Permissions are the unit of authority; roles are just named bundles of them.
 * Every server-side check asks "does this user hold permission X", never "is
 * this user role Y" — so adding a role later never means hunting down role
 * string comparisons scattered through the codebase.
 */

export const PERMISSIONS = {
  // Content
  "content:view": "View content in the admin area",
  "content:create": "Create new content",
  "content:edit": "Edit any content",
  "content:edit_own": "Edit only content you authored",
  "content:delete": "Delete content",
  "content:publish": "Publish or unpublish content",

  // Media
  "media:view": "Browse the media library",
  "media:upload": "Upload images and documents",
  "media:delete": "Delete media",

  // People
  "users:view": "View user accounts",
  "users:create": "Invite or create user accounts",
  "users:edit": "Edit user accounts",
  "users:delete": "Deactivate or delete user accounts",
  "users:assign_roles": "Change what role a user holds",

  // Roles themselves
  "roles:view": "View roles and their permissions",
  "roles:manage": "Create roles and change their permissions",

  // Supporter operations
  "donations:view": "View donation records",
  "donations:manage": "Record, edit and refund donations",
  "volunteers:view": "View volunteer applications",
  "volunteers:manage": "Review and respond to volunteer applications",
  "messages:view": "Read contact enquiries",
  "messages:manage": "Respond to and resolve enquiries",
  "subscribers:view": "View newsletter subscribers",
  "subscribers:manage": "Export and remove subscribers",

  // Recruitment
  "jobs:view": "View all vacancies including drafts",
  "jobs:manage": "Post, edit and close vacancies",
  "applications:view": "View job applications",
  "applications:manage": "Shortlist, progress and reject applications",

  // HR
  "hr:view": "View non-confidential HR requests",
  "hr:manage": "Handle all HR requests, including confidential ones",

  // Organisation
  "settings:view": "View organisation settings",
  "settings:manage": "Change organisation settings",
  "audit:view": "Read the audit log",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

/**
 * Built-in roles, ordered most to least privileged. `rank` matters: a user can
 * never assign a role at or above their own rank, which is what stops an admin
 * from quietly promoting themselves to super admin.
 */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: "SUPER_ADMIN",
    label: "Super Admin",
    rank: 100,
    description:
      "Full control, including roles and settings. Held by the founding account and cannot be removed from the last remaining super admin.",
    permissions: ALL_PERMISSIONS,
  },
  ADMIN: {
    name: "ADMIN",
    label: "Administrator",
    rank: 80,
    description: "Runs day-to-day operations across content, people and supporters.",
    permissions: [
      "content:view", "content:create", "content:edit", "content:delete", "content:publish",
      "media:view", "media:upload", "media:delete",
      "users:view", "users:create", "users:edit",
      "roles:view",
      "donations:view", "donations:manage",
      "volunteers:view", "volunteers:manage",
      "messages:view", "messages:manage",
      "subscribers:view", "subscribers:manage",
      "jobs:view", "jobs:manage",
      "applications:view", "applications:manage",
      "hr:view", "hr:manage",
      "settings:view",
      "audit:view",
    ] as Permission[],
  },
  EDITOR: {
    name: "EDITOR",
    label: "Editor",
    rank: 60,
    description: "Owns the public voice: writes, edits and publishes all content.",
    permissions: [
      "content:view", "content:create", "content:edit", "content:delete", "content:publish",
      "media:view", "media:upload", "media:delete",
      "messages:view",
    ] as Permission[],
  },
  AUTHOR: {
    name: "AUTHOR",
    label: "Author",
    rank: 40,
    description: "Drafts stories and news. Can edit their own work but cannot publish it.",
    permissions: [
      "content:view", "content:create", "content:edit_own",
      "media:view", "media:upload",
    ] as Permission[],
  },
  FINANCE: {
    name: "FINANCE",
    label: "Finance Officer",
    rank: 50,
    description: "Handles donation records and financial reporting. No content access.",
    permissions: [
      "donations:view", "donations:manage",
      "subscribers:view",
      "audit:view",
    ] as Permission[],
  },
  COORDINATOR: {
    name: "COORDINATOR",
    label: "Volunteer Coordinator",
    rank: 45,
    description: "Reviews volunteer applications and answers enquiries.",
    permissions: [
      "volunteers:view", "volunteers:manage",
      "messages:view", "messages:manage",
      "content:view",
    ] as Permission[],
  },
  MEMBER: {
    name: "MEMBER",
    label: "Member",
    rank: 10,
    description:
      "A registered supporter. Can sign in to see their own giving history and volunteer applications, but has no admin access.",
    permissions: [] as Permission[],
  },
} as const;

export type SystemRoleName = keyof typeof SYSTEM_ROLES;

export const ROLE_LIST = Object.values(SYSTEM_ROLES);

/** Roles that grant entry to /admin at all. */
export const STAFF_ROLES: SystemRoleName[] = [
  "SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR", "FINANCE", "COORDINATOR",
];

export function permissionGroup(permission: Permission): string {
  return permission.split(":")[0];
}

/** Human-readable grouping, used to render the role permission matrix. */
export function groupedPermissions(): Record<string, Permission[]> {
  return ALL_PERMISSIONS.reduce<Record<string, Permission[]>>((acc, p) => {
    const group = permissionGroup(p);
    (acc[group] ??= []).push(p);
    return acc;
  }, {});
}

export const GROUP_LABELS: Record<string, string> = {
  content: "Content",
  media: "Media library",
  users: "User accounts",
  roles: "Roles & permissions",
  donations: "Donations",
  volunteers: "Volunteers",
  messages: "Enquiries",
  subscribers: "Newsletter",
  jobs: "Vacancies",
  applications: "Job applications",
  hr: "HR requests",
  settings: "Organisation settings",
  audit: "Audit log",
};
