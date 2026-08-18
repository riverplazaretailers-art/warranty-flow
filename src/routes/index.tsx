import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const TITLE = "Two River Ops | AI Warranty Operations for Equipment Dealers";
const DESCRIPTION =
  "Two River Ops is building AI-operated warranty administration for equipment dealers: repair records become complete claims, routine exceptions are worked, and reimbursement is tracked.";

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
  {
    n: "01",
    title: "Repair record",
    body: "The work order, parts, labor, failure notes and machine history are read directly from the dealer's service records.",
  },
  {
    n: "02",
    title: "Claim built",
    body: "Coverage, causal part, story and documentation requirements are assembled into a complete claim under the OEM's rules.",
  },
  {
    n: "03",
    title: "Submitted",
    body: "Claims are filed through OEM-authorized integrations, on the dealer's account, with a full audit trail.",
  },
  {
    n: "04",
    title: "Exceptions resolved",
    body: "Routine rejections—coding, documentation, labor time, resubmission windows—are worked automatically.",
  },
  {
    n: "05",
    title: "Payment tracked",
    body: "Status, credits and short-pays are monitored and reconciled against what was claimed.",
  },
];

const TRADITIONAL = [
  "Chasing technicians for a usable failure story",
  "Re-keying the same repair data into an OEM portal",
  "Looking up coverage, campaigns and labor allowances",
  "Watching for rejections and resubmission deadlines",
  "Reworking denials line by line",
  "Reconciling credits against submitted claims",
];

const TRO = [
  "Reads the repair record and drafts the failure narrative",
  "Builds the claim once, formatted to OEM requirements",
  "Applies coverage and allowance rules at claim time",
  "Monitors status and deadlines continuously",
  "Works routine rejections without a queue forming",
  "Reconciles payment and flags unexplained variance",
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

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="flex h-4 w-4 flex-col justify-between">
        <span className="block h-[2px] w-full bg-accent" />
        <span className="block h-[2px] w-full bg-foreground/70" />
        <span className="block h-[2px] w-2/3 bg-foreground/30" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Two River Ops</span>
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="transition-opacity hover:opacity-70">
          <Wordmark />
        </a>
        <nav className="flex items-center gap-1 sm:gap-6">
          <a
            href="#warranty"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Warranty
          </a>
          <a
            href="#about"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            About
          </a>
          <a
            href="#pilot"
            className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-accent"
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
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div aria-hidden className="rule-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="fade-up">
          <p className="eyebrow">AI operations for equipment dealers</p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">
            The warranty desk, without the warranty administrator.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            Two River Ops is building an AI-operated warranty service that turns repair records into
            complete claims, works routine exceptions, and tracks reimbursement—with people only
            where judgment is actually required.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#pilot"
              className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-accent"
            >
              Join the pilot
            </a>
            <a
              href="#warranty"
              className="inline-flex h-11 items-center rounded-sm border border-border px-6 text-sm font-medium transition-colors hover:border-foreground/40 hover:bg-stone-warm"
            >
              How it works
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
    "Repair record ingested",
    "Coverage & causal part resolved",
    "Claim assembled",
    "Submitted via OEM-authorized integration",
    "Status monitored · exception worked",
    "Payment reconciled",
  ];
  return (
    <div
      aria-hidden
      className="fade-up relative rounded-sm border border-border bg-card p-6 shadow-[0_1px_0_var(--rule),0_24px_60px_-40px_oklch(0.235_0.023_259/0.45)] sm:p-8"
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="eyebrow">Claim pipeline</span>
        <span className="font-mono text-[11px] text-muted-foreground">illustrative</span>
      </div>
      <ol className="mt-6 space-y-0">
        {nodes.map((node, i) => (
          <li key={node} className="relative flex gap-4 pb-6 last:pb-0">
            {i < nodes.length - 1 && (
              <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
            )}
            <span
              className="flow-dot relative mt-[6px] h-[11px] w-[11px] shrink-0 rounded-full border border-accent bg-background"
              style={{ animationDelay: `${i * 380}ms` }}
            >
              <span className="absolute inset-[2px] rounded-full bg-accent" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">{node}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {i === 4 ? "escalates one specific question" : "automated"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Credibility() {
  const items = [
    "Built for equipment dealers",
    "OEM-specific workflows",
    "Human-backed exceptions",
    "Secure dealer access",
  ];
  return (
    <section className="border-b border-border bg-stone-warm">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 py-8 sm:grid-cols-4">
        {items.map((item) => (
          <li
            key={item}
            className="px-1 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:text-center"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
      {lead && <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="warranty" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <SectionHead
          eyebrow="How it works"
          title="From repair record to reimbursement."
          lead="Routine work runs end to end without a queue. When a fact is genuinely missing—a measurement, a serial, a technician observation—it is escalated as one specific question to one person, not returned as a claim to rework."
        />
        <ol className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <li key={step.n} className="group bg-card p-6 transition-colors hover:bg-stone-warm">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-accent">{step.n}</span>
                <span className="h-px flex-1 bg-border transition-colors group-hover:bg-accent/40" />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
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
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <SectionHead
          eyebrow="Difference"
          title="Not another tool for your warranty administrator."
          lead="Most warranty software gives the administrator a better screen. Two River Ops is built to run the workflow itself. That is the target operating model and the objective of the pilot—not a claim that the role disappears on day one."
        />
        <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-7 sm:p-9">
            <p className="eyebrow">Traditional warranty admin</p>
            <ul className="mt-6 space-y-4">
              {TRADITIONAL.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-[9px] h-px w-4 shrink-0 bg-border" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-7 sm:p-9">
            <p className="eyebrow text-accent">Two River Ops handles the workflow</p>
            <ul className="mt-6 space-y-4">
              {TRO.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed">
                  <span aria-hidden className="mt-[9px] h-px w-4 shrink-0 bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <SectionHead eyebrow="Products" title="Two ways to start." />
        <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2">
          <article className="bg-card p-8 transition-colors hover:bg-stone-warm sm:p-10">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold tracking-tight">Managed Warranty</h3>
              <span className="rounded-sm border border-accent/40 bg-accent/10 px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Pilot
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Ongoing warranty administration from repair record through reimbursement. Claims are
              built, submitted, monitored and reconciled continuously; your team answers exception
              questions instead of running the desk.
            </p>
          </article>
          <article className="bg-card p-8 transition-colors hover:bg-stone-warm sm:p-10">
            <h3 className="text-xl font-semibold tracking-tight">Recovery</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A fixed-fee review of historical denied and short-paid claims. We reconstruct what was
              submitted, identify what is still recoverable within OEM windows, and prepare the
              rework for filing.
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
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:py-24 lg:grid-cols-2">
        <div>
          <SectionHead
            eyebrow="Pilot program"
            title="A narrow pilot, run on your terms."
            lead="We are selecting a small number of construction, agricultural, material-handling and commercial equipment dealers."
          />
          <ul className="mt-10 space-y-6 border-t border-border pt-8">
            {[
              [
                "One OEM, capped volume",
                "The pilot is scoped to a single OEM program and a fixed claim volume so results are measurable.",
              ],
              [
                "The dealer keeps control",
                "Claims are filed on your account, under your approvals, with a complete audit trail.",
              ],
              [
                "You answer questions, not queues",
                "Your team's only routine input is a specific factual question when a record is genuinely missing something.",
              ],
            ].map(([t, d]) => (
              <li key={t}>
                <h3 className="text-sm font-semibold tracking-tight">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
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
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col justify-center rounded-sm border border-border bg-card p-8 sm:p-10">
        <div
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent/10"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor">
            <path
              d="M4 10.5l4 4 8-9"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            />
          </svg>
        </div>
        <h3 className="mt-6 text-xl font-semibold tracking-tight">Request received</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thank you. We review every pilot request individually and will follow up from a Two River
          Ops address with next steps and the scope questions for your OEM program.
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
      onSubmit={(e) => {
        e.preventDefault();
        setPending(true);
        window.setTimeout(() => {
          setPending(false);
          setSubmitted(true);
        }, 550);
      }}
      className="rounded-sm border border-border bg-card p-8 sm:p-10"
    >
      <p className="eyebrow">Request pilot access</p>
      <div className="mt-7 space-y-5">
        <Field id="name" label="Name" required autoComplete="name" />
        <Field id="email" label="Work email" type="email" required autoComplete="email" />
        <Field id="company" label="Company" required autoComplete="organization" />
        <Field id="oems" label="OEM brands represented" required placeholder="e.g. brands you carry" />
        <div>
          <label htmlFor="note" className="block text-sm font-medium">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            className="mt-2 w-full resize-none rounded-sm border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Claim volume, current process, anything relevant."
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-accent disabled:opacity-70"
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
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">About</p>
          <p className="mt-6 text-2xl font-medium leading-snug tracking-[-0.02em] sm:text-[2rem]">
            Two River Ops builds AI-operated back-office workflows where software does the
            repetitive work and people handle exceptions.
          </p>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            Warranty administration is the first workflow because it is high-volume, rule-bound and
            expensive to staff. The same operating model applies to the rest of the dealer back
            office.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 text-sm text-muted-foreground">
            Equipment operations, rebuilt for AI.
          </p>
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
