import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

const TITLE = "Warranty Flow demo workspace | TwoRiverOps";
const DESCRIPTION =
  "Synthetic demo workspace for Warranty Flow claim preflight: upload a repair record, get a claim-ready packet, evidence-linked findings and the exact missing facts.";

export const Route = createFileRoute("/demo")({
  component: DemoLayout,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const NAV = [
  { to: "/demo", label: "Dashboard", exact: true },
  { to: "/demo/new", label: "New review", exact: false },
  { to: "/demo/history", label: "History", exact: false },
  { to: "/demo/settings", label: "Settings", exact: false },
  { to: "/demo/help", label: "Help", exact: false },
] as const;

function DemoLayout() {
  const parentUrl =
    (import.meta.env as Record<string, string | undefined>)["VITE_TWORIVEROPS_URL"] ||
    "https://tworiverops.com";

  return (
    <div className="min-h-screen bg-stone-warm font-sans text-foreground antialiased">
      <div className="border-b border-border bg-foreground/[0.04]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2">
          <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-accent" aria-hidden />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Synthetic demo workspace — no real dealer, OEM or claim data
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex h-4 w-4 flex-col justify-between">
              <span className="block h-px w-full bg-accent" />
              <span className="block h-px w-full bg-foreground/60" />
              <span className="block h-px w-2/3 bg-foreground/25" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Warranty Flow</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
              A TwoRiverOps solution
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href={parentUrl}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to TwoRiverOps
            </a>
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Exit demo
            </Link>
          </div>
        </div>
        <nav className="border-t border-border bg-background">
          <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="inline-flex h-11 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "!border-accent !text-foreground font-medium" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs leading-relaxed text-muted-foreground">
          Demo only. Extraction and checks are decision support — the dealer confirms facts,
          eligibility, coding, attestation, parts retention and submission. Dealer-submit mode is
          the default. Analyses are stored in this browser only.
        </div>
      </footer>
    </div>
  );
}
