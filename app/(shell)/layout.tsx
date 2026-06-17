import { BottomTabBar } from "@/components/layout/bottom-tab-bar";

// Tabbed shell: Übungen / Verlauf / Profil. Pushed sub-screens (under /uebung)
// live outside this group and therefore render without the tab bar.
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px]">
      <main
        className="no-scrollbar px-[22px]"
        style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
