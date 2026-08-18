"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, Mail, MapPin, Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";
import { AfterHoursLines } from "@/components/site/after-hours-lines";
import { primaryNav } from "@/lib/site";
import type { OrgSettings } from "@/lib/repos/settings";
import { cn } from "@/lib/utils";

/**
 * Site header.
 *
 * Two visual states, and which one applies depends on what is underneath:
 *
 *  - Over the homepage's dark hero, and only there, the bar is transparent with
 *    a blur so the photography reads through it. Nav text goes white.
 *  - Everywhere else — and on the homepage once scrolled — it is a solid white
 *    surface with dark text.
 *
 * The route check matters: inner pages have light heroes, and white nav text
 * over a pale blue hero is unreadable. Rather than let every page declare its
 * own hero tone, the header derives it from the one page that has a dark one.
 *
 * Login lives here; donating does not. A donation is a considered decision made
 * in the page body where the case for it has been argued — the nav's job is to
 * get people to the right place, and to let staff in.
 */
export function Header({ site }: { site: OrgSettings }) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<{
    path: string;
    open: string | null;
    mobile: boolean;
  }>({ path: pathname, open: null, mobile: false });
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Navigating closes any open menu. Derived during render from the pathname
  // rather than reset in an effect, which would cost a second render pass on
  // every navigation.
  const openMenu = menuState.path === pathname ? menuState.open : null;
  const mobileOpen = menuState.path === pathname ? menuState.mobile : false;

  const setOpenMenu = useCallback(
    (open: string | null) => setMenuState({ path: pathname, open, mobile: false }),
    [pathname],
  );
  const setMobileOpen = useCallback(
    (mobile: boolean) => setMenuState({ path: pathname, open: null, mobile }),
    [pathname],
  );

  useEffect(() => {
    // Switch to the solid treatment well before the hero scrolls away. The
    // hero paints a dark scrim across its top 10rem specifically so the
    // translucent bar always has something dark behind it; past that point
    // white nav text would be over open page, so we go opaque first.
    const onScroll = () => setScrolled(window.scrollY > 96);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [setOpenMenu, setMobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Two distinct things, previously conflated:
  //
  //   isHome — the header floats over the hero rather than sitting above it.
  //            Fixed for the whole page, so it never jumps position on scroll.
  //   onDark — the bar is transparent, true only while it is actually over
  //            the dark hero.
  const isHome = pathname === "/";
  const onDark = isHome && !scrolled;

  return (
    <div className={cn(isHome && "fixed inset-x-0 top-0 z-50")}>
      {/* Utility bar. Address, phones and email, the way every established
          Kenyan health NGO opens its site. Hidden on small screens, where it
          would push the navigation below the fold for no benefit. */}
      <div className={cn("hidden border-b border-navy-800 bg-navy-950", isHome ? "lg:hidden" : "lg:block")}>
        <div className="container-page flex items-center justify-between gap-8 py-1.5 text-[0.6875rem] font-medium text-white/45">
          <p className="flex items-center gap-2">
            <MapPin className="size-3 shrink-0 text-azure-400/70" aria-hidden="true" />
            {site.contact.address.street}, {site.contact.address.locality}{" "}
            {site.contact.address.postalCode}
          </p>
          <div className="flex items-center gap-5">
            <p className="flex items-center gap-2">
              <Phone className="size-3 shrink-0 text-azure-400/70" aria-hidden="true" />
              {site.customerCare.lines.map((number, i) => (
                <span key={number}>
                  {i > 0 && <span className="mx-1.5 text-white/20">·</span>}
                  <a
                    href={`tel:${number.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-white"
                  >
                    {number}
                  </a>
                </span>
              ))}
            </p>
            <a
              href={`mailto:${site.contact.email}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail className="size-3 shrink-0 text-azure-400/70" aria-hidden="true" />
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>

      {/* Crisis strip. Present on every page, above everything else. */}
      <div className={cn(onDark ? "bg-navy-950/45 backdrop-blur-md" : "bg-navy-950", "text-white")}>
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 text-[0.8125rem]">
          <p className="flex items-center gap-2 font-semibold">
            <Phone className="size-3.5 shrink-0 text-azure-300" aria-hidden="true" />
            <span>
              Need help now? UCC hotline{" "}
              <a
                href={`tel:${site.help.lines[0].number.replace(/\s/g, "")}`}
                className="font-bold text-azure-300 underline-offset-4 hover:underline"
              >
                {site.help.lines[0].number}
              </a>{" "}
              <span className="font-medium text-white/60">· confidential</span>
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <AfterHoursLines variant="inline" />
            <Link
              href="/get-help"
              className="font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              All support services →
            </Link>
          </div>
        </div>
      </div>

      <header
        className={cn(
          isHome ? "border-b" : "sticky top-0 z-50 border-b",
          onDark
            ? "border-white/10 bg-navy-950/55 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl"
            : "border-navy-100 bg-white shadow-[0_1px_0_rgb(0_16_58/0.06),0_8px_24px_-16px_rgb(0_16_58/0.25)]",
        )}
      >
        <div className="container-page flex h-20 items-center justify-between gap-4">
          {/* Deliberately large: the mark is the organisation's identity and
              the thing a returning visitor recognises before reading a word. */}
          <Logo size="lg" invert={onDark} />

          <nav ref={navRef} className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
            {primaryNav.map((item) => {
              const hasChildren = "children" in item && item.children;
              const active = isActive(item.href);
              const highlight = "highlight" in item && item.highlight;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[0.9375rem] font-bold transition-colors",
                      onDark
                        ? active
                          ? "bg-white/20 text-white"
                          : "text-white hover:bg-white/15"
                        : active
                          ? "bg-azure-50 text-azure-800"
                          : "text-navy-700 hover:bg-navy-50 hover:text-navy-950",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }

              const open = openMenu === item.label;
              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(open ? null : item.label)}
                    onMouseEnter={() => setOpenMenu(item.label)}
                    aria-expanded={open}
                    aria-haspopup="true"
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.9375rem] font-bold transition-colors",
                      onDark
                        ? active || open
                          ? "bg-white/20 text-white"
                          : "text-white hover:bg-white/15"
                        : active || open
                          ? "bg-azure-50 text-azure-800"
                          : "text-navy-700 hover:bg-navy-50 hover:text-navy-950",
                    )}
                  >
                    {highlight && (
                      <span className={cn("mr-0.5 size-2 rounded-full", onDark ? "bg-azure-300" : "bg-azure-500")} aria-hidden="true" />
                    )}
                    {item.label}
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", open && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>

                  {open && (
                    <div
                      onMouseLeave={() => setOpenMenu(null)}
                      className="absolute left-0 top-full w-80 pt-2"
                    >
                      <div className="animate-fade-up overflow-hidden rounded-card border border-navy-100 bg-white p-2 shadow-lift">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-azure-50"
                          >
                            <span className="block text-[0.9375rem] font-bold text-navy-950">
                              {child.label}
                            </span>
                            <span className="mt-0.5 block text-[0.8125rem] font-medium leading-snug text-navy-500">
                              {child.desc}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/login" size="md" className="px-5">
              <LogIn className="size-4" aria-hidden="true" />
              Login
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "grid size-11 place-items-center rounded-full transition-colors xl:hidden",
                onDark
                  ? "text-white hover:bg-white/15"
                  : "text-navy-900 hover:bg-navy-50",
              )}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="border-t border-azure-200/60 bg-white xl:hidden">
            <nav className="container-page max-h-[70vh] overflow-y-auto py-4" aria-label="Mobile">
              {primaryNav.map((item) => (
                <div key={item.label} className="border-b border-navy-50 py-1 last:border-0">
                  <Link
                    href={item.href}
                    className={cn(
                      "block py-2.5 text-base font-bold",
                      "highlight" in item && item.highlight ? "text-azure-700" : "text-navy-950",
                    )}
                  >
                    {item.label}
                  </Link>
                  {"children" in item && item.children && (
                    <div className="mb-2 ml-3 flex flex-col gap-0.5 border-l-2 border-azure-100 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="py-1.5 text-sm font-semibold text-navy-600 hover:text-navy-950"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 flex flex-col gap-2 pb-2">
                <ButtonLink href="/login" size="md">
                  <LogIn className="size-4" aria-hidden="true" />
                  Login
                </ButtonLink>
                <ButtonLink href="/get-help" variant="outline" size="md">
                  Get help
                </ButtonLink>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="mt-1 text-center text-sm font-semibold text-navy-500"
                >
                  {site.contact.phone}
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
