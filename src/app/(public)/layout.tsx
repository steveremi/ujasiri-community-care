import type { ReactNode } from "react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { getSettings } from "@/lib/repos/settings";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const site = await getSettings();

  return (
    <>
      {/* Organisation structured data is emitted once, in the layout, so every
          public page carries it without each page restating the same facts. */}
      <OrganizationJsonLd />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header site={site} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
