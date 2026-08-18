import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { submitPilotLead } from "@/lib/pilot-leads.functions";

const TITLE = "Two River Ops | AI Warranty Operations for Equipment Dealers";
const DESCRIPTION =
  "Two River Ops is building a managed, AI-operated warranty administration service for equipment dealers: repair records become complete claims, routine exceptions are worked, and reimbursement is tracked.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Two River Ops",
          url: "https://tworiverops.com",
          description: DESCRIPTION,
        }),
      },
    ],
  }),
});

const STEPS = [
  ["01", "Repair record received", "The work order, parts, labor and failure notes come in as they are."],
  ["02", "Claim built and checked", "Coverage, causal part and documentation are assembled and validated."],
  ["03", "Submitted through approved OEM workflow", "Filed on the dealer's account, under the dealer's authorization."],
  ["04", "Routine issues worked", "Coding, documentation and resubmission windows are handled without a queue."],
  ["05", "Payment tracked and reconciled", "Credits and short-pays are matched against what was claimed."],
];

const TRADITIONAL = [
  "Review ROs",
  "Interpret OEM policy",
  "Build claims",
  "Attach evidence",
  "Submit and monitor",
  "Rework denials",
  "Reconcile payment",
];

const TRO = [
  "Intake and structure the repair record",
  "Build a grounded claim",
  "Validate requirements",
  "Execute the approved workflow",
  "Work routine exceptions",
  "Track reimbursement",
  "Escalate only missing facts",
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Nav />
      <main>
        <Hero />
        <Credibility />
        <HowItWorks />
        <Differentiation />
        <Products />
        <Pilot />
        <About />
      </main>
      <Footer />
    </div>
  );
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="flex h-4 w-4 flex-col justify-between">
        <span className="block h-px w-full bg-accent" />
        <span className="block h-px w-full bg-foreground/60" />
        <span className="block h-px w-2/3 bg-foreground/25" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Two River Ops</span>
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#top" className="transition-opacity hover:opacity-70">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-6">
          <a
            href="#warranty"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            How it works
          </a>
          <a
            href="#about"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            About
          </a>
          <a
            href="#pilot"
            className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            Join the pilot
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 md:pb-28 md:pt-32">
        <div className="fade-up max-w-3xl">
          <p className="eyebrow">AI operations for equipment dealers</p>
          <h1 className="mt-8 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Warranty administration, handled.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Two River Ops is building a managed warranty operation that turns repair records into
            complete claims, works routine exceptions, and tracks reimbursement — with people only
            where judgment is actually required.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#pilot"
              className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
            >
              Join the pilot
            </a>
            <a
              href="#warranty"
              className="inline-flex h-11 items-center rounded-sm border border-border px-6 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-stone-warm"
            >
              See how it works
            </a>
          </div>
        </div>
        <WorkflowVisual />
      </div>
    </section>
  );
}

function WorkflowVisual() {
  const nodes = [
    ["Repair record", "Received"],
    ["Claim build", "Checked"],
    ["Submission", "Approved workflow"],
    ["Exceptions", "Worked"],
    ["Reimbursement", "Reconciled"],
  ];
  return (
    <div
      aria-hidden
      className="fade-up mt-20 border-t border-border pt-10"
      style={{ animationDelay: "140ms" }}
    >
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Claim pipeline</span>
        <span className="font-mono text-[11px] text-muted-foreground">illustrative</span>
      </div>
      <ol className="mt-8 grid gap-px bg-border sm:grid-cols-5">
        {nodes.map(([label, status], i) => (
          <li key={label} className="relative bg-background px-1 py-5 sm:px-4">
            <div className="flex items-center gap-3">
              <span className="flow-dot h-[7px] w-[7px] shrink-0 rounded-full bg-accent" style={{ animationDelay: `${i * 400}ms` }} />
              <span className="h-px flex-1 bg-border" />
            </div>
            <p className="mt-4 text-sm font-medium leading-snug">{label}</p>
            <p className="mt-2 inline-block rounded-sm border border-border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {status}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Credibility() {
  const items = [
    "Equipment dealer focused",
    "OEM-specific workflows",
    "Human-backed exceptions",
    "Secure dealer access",
  ];
  return (
    <section className="border-b border-border bg-stone-warm">
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-y-3 px-6 py-7 sm:grid-cols-4">
        {items.map((item) => (
          <li
            key={item}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.025em] sm:text-[2.5rem] sm:leading-[1.1]">
        {title}
      </h2>
      {lead && <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="warranty" className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <SectionHead
          eyebrow="How it works"
          title="From repair record to reimbursement."
          lead="If a required fact is missing, the dealer gets one specific question — not a claim to rework."
        />
        <ol className="mt-16 divide-y divide-border border-y border-border">
          {STEPS.map(([n, title, body]) => (
            <li key={n} className="grid gap-2 py-7 sm:grid-cols-[3rem_1fr_1fr] sm:gap-8">
              <span className="font-mono text-[11px] text-accent">{n}</span>
              <h3 className="text-base font-medium tracking-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Differentiation() {
  return (
    <section className="border-b border-border bg-stone-warm">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <SectionHead
          eyebrow="Difference"
          title="We are not building another tool for your warranty administrator."
          lead="The target operating model is simpler: the dealer sends the work; Two River Ops owns the workflow."
        />
        <div className="mt-16 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-7 sm:p-10">
            <p className="eyebrow">Traditional warranty admin</p>
            <ul className="mt-7 space-y-3.5">
              {TRADITIONAL.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                  <span aria-hidden className="mt-[9px] h-px w-4 shrink-0 bg-border" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-7 sm:p-10">
            <p className="eyebrow text-accent">Two River Ops</p>
            <ul className="mt-7 space-y-3.5">
              {TRO.map((t) => (
                <li key={t} className="flex gap-3 text-sm">
                  <span aria-hidden className="mt-[9px] h-px w-4 shrink-0 bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Pilot performance will determine how much of each OEM workflow can be handled
          autonomously.
        </p>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <SectionHead eyebrow="Products" title="Two ways to start." />
        <div className="mt-16 grid gap-px border-y border-border bg-border md:grid-cols-2">
          <article className="bg-background p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold tracking-tight">Managed Warranty</h3>
              <span className="rounded-sm border border-accent/40 px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Pilot
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Ongoing warranty administration from repair record through reimbursement.
            </p>
          </article>
          <article className="bg-background p-8 sm:p-10">
            <h3 className="text-xl font-semibold tracking-tight">Recovery</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Fixed-fee review of historical denied, short-paid, or abandoned warranty claims.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Pilot() {
  return (
    <section id="pilot" className="border-b border-border bg-stone-warm">
      <div className="mx-auto grid max-w-5xl gap-16 px-6 py-24 md:py-32 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHead
            eyebrow="Pilot program"
            title="Help us build the warranty operation you actually want."
            lead="We are selecting a small number of construction, agricultural, material-handling, and commercial equipment dealers for one-OEM, capped-volume pilots."
          />
          <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
            {[
              "One OEM to start",
              "Capped claim volume",
              "Dealer-controlled authorization",
              "Escalation only for missing facts",
            ].map((t) => (
              <li key={t} className="bg-stone-warm px-5 py-4 text-sm font-medium tracking-tight">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <PilotForm />
      </div>
    </section>
  );
}

function PilotForm() {
  const submit = useServerFn(submitPilotLead);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="flex flex-col justify-center border border-border bg-card p-8 sm:p-10">
        <div
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" fill="none" stroke="currentColor">
            <path d="M4 10.5l4 4 8-9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-6 text-xl font-semibold tracking-tight">Request received</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We review every pilot request individually and will follow up from a Two River Ops address
          with next steps and scope questions for your OEM program.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 self-start text-sm font-medium text-accent underline-offset-4 transition-colors hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setPending(true);
        setError(null);
        try {
          await submit({
            data: {
              name: String(fd.get("name") ?? ""),
              work_email: String(fd.get("work_email") ?? ""),
              company: String(fd.get("company") ?? ""),
              oem_brands: String(fd.get("oem_brands") ?? ""),
              note: String(fd.get("note") ?? ""),
              website: String(fd.get("website") ?? ""),
            },
          });
          setSubmitted(true);
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setPending(false);
        }
      }}
      className="border border-border bg-card p-8 sm:p-10"
    >
      <p className="eyebrow">Request pilot access</p>
      <div className="mt-8 space-y-5">
        <Field id="name" label="Name" required autoComplete="name" />
        <Field id="work_email" label="Work email" type="email" required autoComplete="email" />
        <Field id="company" label="Company" required autoComplete="organization" />
        <Field id="oem_brands" label="OEM brands represented" placeholder="Brands you carry" />
        <div>
          <label htmlFor="note" className="block text-sm font-medium">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={1000}
            className="mt-2 w-full resize-none rounded-sm border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Claim volume, current process, anything relevant."
          />
        </div>
        <div aria-hidden className="hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      {error && <p className="mt-5 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-70"
      >
        {pending ? "Sending…" : "Request pilot access"}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        We use this only to evaluate pilot fit. No newsletter, no resale.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        maxLength={255}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}

function About() {
  return (
    <section id="about" className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow">About</p>
          <p className="mt-7 text-2xl font-medium leading-snug tracking-[-0.025em] sm:text-[2rem]">
            Two River Ops builds AI-operated back-office workflows where software does the
            repetitive work and people handle exceptions.
          </p>
          <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">
            Warranty administration is the first operating vertical.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 text-sm text-muted-foreground">Equipment operations, rebuilt for AI.</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <span className="font-mono text-xs">© 2026 Two River Ops</span>
        </div>
      </div>
    </footer>
  );
}
