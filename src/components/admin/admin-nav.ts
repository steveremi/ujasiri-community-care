import type { Permission } from "@/lib/auth/rbac";

/**
 * Admin navigation.
 *
 * Each entry declares the permission it requires. The sidebar filters itself
 * against the signed-in user's permissions, so a Finance Officer never sees a
 * Content menu they cannot open.
 *
 * This is presentation only — hiding a link is a courtesy, not a control. Every
 * page behind these links calls requirePermission for itself.
 */

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  /** Any one of these grants visibility. */
  permissions: Permission[];
  description?: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "LayoutDashboard",
        permissions: [],
        description: "What needs your attention",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "News & stories",
        href: "/admin/posts",
        icon: "Newspaper",
        permissions: ["content:view"],
        description: "Articles, stories and reports",
      },
      {
        label: "Programmes",
        href: "/admin/programs",
        icon: "HeartHandshake",
        permissions: ["content:edit"],
        description: "The five programme areas",
      },
      {
        label: "Projects",
        href: "/admin/projects",
        icon: "MapPin",
        permissions: ["content:edit"],
        description: "Where we work",
      },
      {
        label: "Events",
        href: "/admin/events",
        icon: "CalendarDays",
        permissions: ["content:edit"],
      },
      {
        label: "Media library",
        href: "/admin/media",
        icon: "Images",
        permissions: ["media:view"],
        description: "Photographs and consent records",
      },
    ],
  },
  {
    title: "Supporters",
    items: [
      {
        label: "Donations",
        href: "/admin/donations",
        icon: "HandCoins",
        permissions: ["donations:view"],
      },
      {
        label: "Volunteers",
        href: "/admin/volunteers",
        icon: "Users",
        permissions: ["volunteers:view"],
      },
      {
        label: "Enquiries",
        href: "/admin/messages",
        icon: "MessageSquare",
        permissions: ["messages:view"],
      },
      {
        label: "Newsletter",
        href: "/admin/subscribers",
        icon: "Mail",
        permissions: ["subscribers:view"],
      },
    ],
  },
  {
    title: "Recruitment & HR",
    items: [
      {
        label: "Vacancies",
        href: "/admin/jobs",
        icon: "Briefcase",
        permissions: ["jobs:view"],
        description: "Post and close job adverts",
      },
      {
        label: "Applications",
        href: "/admin/applications",
        icon: "FileUser",
        permissions: ["applications:view"],
        description: "Shortlist and progress candidates",
      },
      {
        label: "HR requests",
        href: "/admin/hr",
        icon: "ClipboardList",
        permissions: ["hr:view", "hr:manage"],
        description: "Leave, grievances and policy queries",
      },
    ],
  },
  {
    title: "Organisation",
    items: [
      {
        label: "People",
        href: "/admin/users",
        icon: "UserCog",
        permissions: ["users:view"],
        description: "Accounts and access",
      },
      {
        label: "Roles & permissions",
        href: "/admin/roles",
        icon: "ShieldCheck",
        permissions: ["roles:view"],
      },
      {
        label: "Audit log",
        href: "/admin/audit",
        icon: "ScrollText",
        permissions: ["audit:view"],
        description: "Who did what, and when",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "Settings",
        permissions: ["settings:view"],
      },
    ],
  },
];

/** Filter the navigation to what this user may actually reach. */
export function visibleNav(userPermissions: Permission[]): AdminNavGroup[] {
  return adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.permissions.length === 0 ||
          item.permissions.some((p) => userPermissions.includes(p)),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
