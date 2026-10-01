import { Container } from "@/components/ui/Container";
import { SearchDialog } from "@/components/search/SearchDialog";

import { MobileNav } from "./MobileNav";
import { PrimaryNav } from "./PrimaryNav";
import { SiteLogo } from "./SiteLogo";

/**
 * Sticky site header.
 *
 * Desktop: logo · nav · search trigger.
 * Mobile:  logo · search trigger · menu button, plus a scrollable link strip.
 *
 * The header itself is a server component; only `PrimaryNav`, `SearchDialog`
 * and `MobileNav` ship JS.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-80 border-b border-white/5 bg-ink-950/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <SiteLogo />

        <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
          <PrimaryNav variant="desktop" />
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-28 sm:w-56 lg:w-72">
            <SearchDialog />
          </div>
          <MobileNav />
        </div>
      </Container>

      {/* Mobile link strip — keeps primary destinations one tap away. */}
      <nav aria-label="Primary mobile" className="border-t border-white/5 lg:hidden">
        <Container className="overflow-x-auto py-1.5">
          <PrimaryNav variant="strip" />
        </Container>
      </nav>
    </header>
  );
}