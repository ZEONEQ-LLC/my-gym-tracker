"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartTabIcon, DumbbellTabIcon, ProfileTabIcon } from "@/components/ui/icons";

const TABS = [
  { href: "/", label: "Übungen", Icon: DumbbellTabIcon, match: (p: string) => p === "/" },
  { href: "/verlauf", label: "Verlauf", Icon: ChartTabIcon, match: (p: string) => p.startsWith("/verlauf") },
  { href: "/profil", label: "Profil", Icon: ProfileTabIcon, match: (p: string) => p.startsWith("/profil") },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="no-scrollbar fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[480px] items-start justify-around border-t border-line bg-app/90 px-3 pt-2.5 backdrop-blur-md"
      style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 pt-1"
            style={{ color: active ? "var(--accent)" : "#9aa0a6" }}
          >
            <Icon active={active} />
            <span className="text-[11px] font-semibold tracking-tight">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
