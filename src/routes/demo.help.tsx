import { createFileRoute } from "@tanstack/react-router";

import { PageHead, Panel } from "@/components/demo/demo-ui";

export const Route = createFileRoute("/demo/help")({
  component: Help,
  head: () => ({
    meta: [
      { title: "Warranty Flow demo help | Warranty Flow" },
      {
        name: "description",
        content:
          "How preflight statuses, evidence references and browser-local storage work in the Warranty Flow synthetic demo.",
      },
      { property: "og:title", content: "Warranty Flow demo help | Warranty Flow" },
      {
        property: "og:description",
        content:
          "How preflight statuses, evidence references and browser-local storage work in the Warranty Flow synthetic demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const SECTIONS: [string, string[]][] = [
  [
    "What this demo does",
    [
      "Reads a repair record (PDF with a text layer, TXT or CSV) in your browser.",
      "Extracts the facts a warranty claim needs and keeps an evidence reference to the file, page, row or line.",
      "Runs deterministic preflight checks and returns blockers, warnings, confirmed facts and the exact questions that remain.",
      "Exports a claim packet as JSON, CSV, or a print-friendly page you can save as PDF.",
    ],
  ],
  [
    "Result statuses",
    [
      "Ready for dealer review — no blockers remain. The dealer still confirms and submits.",
      "Needs facts — one or more required facts are missing or inconsistent. Each has a specific question.",
      "OCR required — the PDF has no usable text layer. Nothing was assumed from it.",
      "Unsupported — the file type or document cannot be processed by this demo.",
    ],
  ],
  [
    "What it does not do",
    [
      "It does not submit anything to an OEM. Dealer-submit mode is the default.",
      "It does not connect to a dealer management system.",
      "It does not determine coverage, eligibility or reimbursement. Those remain dealer decisions.",
      "It does not retain parts. Physical custody of a failed component stays with the dealer.",
    ],
  ],
  [
    "Data handling",
    [
      "Files are read in the browser. Nothing is uploaded from this demo.",
      "Analyses are kept in this browser's local storage and can be deleted from Settings or History.",
      "All sample material is synthetic and labelled as such.",
    ],
  ],
];

function Help() {
  return (
    <div className="space-y-8">
      <PageHead eyebrow="Help" title="How claim preflight works" />
      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map(([title, items]) => (
          <Panel key={title} title={title}>
            <ul className="space-y-3 px-5 py-5 text-sm leading-relaxed text-muted-foreground">
              {items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
