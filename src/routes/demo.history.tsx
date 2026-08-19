import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHead, Panel, StatusChip, secondaryButtonClass } from "@/components/demo/demo-ui";
import { useDemoReviews } from "@/hooks/use-demo-reviews";

export const Route = createFileRoute("/demo/history")({
  component: History,
  head: () => ({
    meta: [
      { title: "Warranty Flow demo history | Warranty Flow" },
      {
        name: "description",
        content:
          "Every claim preflight you have run in this browser, with status and blocker counts. Stored locally only.",
      },
      { property: "og:title", content: "Warranty Flow demo history | Warranty Flow" },
      {
        property: "og:description",
        content:
          "Every claim preflight you have run in this browser, with status and blocker counts. Stored locally only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function History() {
  const { reviews, loaded, deleteAll } = useDemoReviews();

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="History"
        title="Demo analyses"
        lead="Stored in this browser (localStorage) only. Clearing them is immediate and cannot be undone."
        action={
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => void deleteAll()}
            disabled={reviews.length === 0}
          >
            Delete all local analyses
          </button>
        }
      />

      <Panel>
        {reviews.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-foreground">
            {loaded ? "Nothing stored in this browser." : "Loading…"}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <Link
                    to="/demo/review/$id"
                    params={{ id: review.id }}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {review.fileName}
                  </Link>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {new Date(review.createdAt).toLocaleString()} · {review.fields.length} facts ·{" "}
                    {review.reviewed ? "marked reviewed" : "open"}
                  </p>
                </div>
                <StatusChip status={review.preflight?.status ?? "not_run"} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
