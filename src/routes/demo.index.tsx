import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHead, Panel, StatusChip, buttonClass } from "@/components/demo/demo-ui";
import { useDemoReviews } from "@/hooks/use-demo-reviews";

export const Route = createFileRoute("/demo/")({ component: Dashboard });

function Dashboard() {
  const { reviews, loaded } = useDemoReviews();

  const blockers = reviews.reduce(
    (sum, review) =>
      sum + (review.preflight?.findings.filter((f) => f.severity === "blocker").length ?? 0),
    0,
  );
  const ready = reviews.filter((r) => r.preflight?.status === "ready_for_dealer_review").length;
  const lastActivity = reviews
    .map((review) => review.updatedAt)
    .sort()
    .at(-1);

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="Dashboard"
        title="Claim preflight"
        lead="Everything below is derived only from the synthetic records you have created in this browser."
        action={
          <Link to="/demo/new" className={buttonClass}>
            New claim review
          </Link>
        }
      />

      <div className="grid gap-px border border-border bg-border sm:grid-cols-4">
        {[
          ["Reviews in this browser", loaded ? String(reviews.length) : "—"],
          ["Ready for dealer review", loaded ? String(ready) : "—"],
          ["Open blockers", loaded ? String(blockers) : "—"],
          [
            "Last activity",
            lastActivity ? new Date(lastActivity).toLocaleString() : loaded ? "None yet" : "—",
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-background px-5 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-3 text-xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Recent reviews"
        description="Stored in this browser only. Nothing is uploaded."
      >
        {reviews.length === 0 ? (
          <div className="px-5 py-10 text-sm text-muted-foreground">
            {loaded
              ? "No reviews yet. Start one from a synthetic sample or your own PDF, TXT or CSV."
              : "Loading…"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Record</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 font-normal">Blockers</th>
                  <th className="px-5 py-3 font-normal">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {reviews.slice(0, 8).map((review) => (
                  <tr key={review.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        to="/demo/review/$id"
                        params={{ id: review.id }}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {review.fileName}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={review.preflight?.status ?? "not_run"} />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {review.preflight?.findings.filter((f) => f.severity === "blocker").length ?? 0}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(review.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Recovery">
        <div className="px-5 py-5">
          <span className="inline-flex items-center rounded-sm border border-border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Pilot service — upload not yet enabled
          </span>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Historical review of denied, short-paid, missed, aging or abandoned claims is delivered
            as a fixed-fee engagement. It is not a self-serve upload in this demo, and nothing here
            pretends otherwise.
          </p>
        </div>
      </Panel>
    </div>
  );
}
