"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileUser,
  HandCoins,
  HeartHandshake,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Newspaper,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { LogoMark } from "@/components/site/logo";
import { visibleNav } from "@/components/admin/admin-nav";
import type { Permission } from "@/lib/auth/rbac";
import { cn, initials } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  Briefcase,
  FileUser,
  ClipboardList,
  Newspaper,
  HeartHandshake,
  MapPin,
  CalendarDays,
  Images,
  HandCoins,
  Users,
  MessageSquare,
  Mail,
  UserCog,
  ShieldCheck,
  ScrollText,
  Settings,
} as const;

export function AdminSidebar({
  permissions,
  user,
}: {
  permissions: Permission[];
  user: { name: string; email: string; roleLabel: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = visibleNav(permissions);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-white/50">
            {group.title}
          </h2>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboard;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-azure-600 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const account = (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-azure-600 text-sm font-semibold text-white">
          {initials(user.name || user.email)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">
            {user.name || user.email}
          </span>
          <span className="block truncate text-xs text-white/50">{user.roleLabel}</span>
        </span>
      </div>
      <div className="mt-1 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          View the website
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="size-8" />
          <span className="font-extrabold text-navy-950">Ujasiri Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full text-navy-800 hover:bg-navy-50"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy-950/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-950">
            <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
              <LogoMark className="size-8" />
              <span className="font-extrabold text-white">Ujasiri Admin</span>
            </div>
            {nav}
            {account}
          </aside>
        </div>
      )}

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-navy-950 lg:flex">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5"
        >
          <LogoMark className="size-8" />
          <span className="font-extrabold text-white">Ujasiri Admin</span>
        </Link>
        {nav}
        {account}
      </aside>
    </>
  );
}
