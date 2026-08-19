import { createFileRoute } from "@tanstack/react-router";

import { PageHead, Panel, secondaryButtonClass } from "@/components/demo/demo-ui";
import { useDemoReviews } from "@/hooks/use-demo-reviews";
import { resolveRuntimeConfig } from "@/product-api";

export const Route = createFileRoute("/demo/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Warranty Flow demo settings | Warranty Flow" },
      {
        name: "description",
        content:
          "Runtime mode, capabilities and local data controls for the Warranty Flow synthetic demo workspace.",
      },
      { property: "og:title", content: "Warranty Flow demo settings | Warranty Flow" },
      {
        property: "og:description",
        content:
          "Runtime mode, capabilities and local data controls for the Warranty Flow synthetic demo workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Settings() {
  const { reviews, deleteAll } = useDemoReviews();
  const config = resolveRuntimeConfig();

  const rows: [string, string][] = [
    ["Runtime mode", config.mode],
    ["Reason", config.reason],
    ["Claim preflight", config.capabilities.claimPreflight ? "Available (local)" : "Unavailable"],
    ["Recovery upload", config.capabilities.recoveryUpload ? "Available" : "Not enabled"],
    [
      "DMS ingestion",
      config.capabilities.dmsIngestion ? "Available" : "Planned — approval dependent",
    ],
    [
      "OEM submission",
      config.capabilities.oemSubmission ? "Available" : "Planned — approval dependent",
    ],
    [
      "Reimbursement reconciliation",
      config.capabilities.reimbursementReconciliation
        ? "Available"
        : "Planned — approval dependent",
    ],
    ["Submission model", "Dealer-submit (default)"],
  ];

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="Settings"
        title="Workspace"
        lead="This demo has no accounts, no billing and no production data path."
      />

      <Panel title="Capabilities">
        <dl className="divide-y divide-border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-3 px-5 py-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono text-xs">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="Local data" description="Stored in this browser only.">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <p className="text-sm text-muted-foreground">
            {reviews.length} analysis record(s) held in this browser&rsquo;s local storage.
          </p>
          <button type="button" className={secondaryButtonClass} onClick={() => void deleteAll()}>
            Delete all local analyses
          </button>
        </div>
      </Panel>
    </div>
  );
}
