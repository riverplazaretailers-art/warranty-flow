import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import {
  PageHead,
  Panel,
  StatusChip,
  buttonClass,
  secondaryButtonClass,
} from "@/components/demo/demo-ui";
import { getProductApi, type ClaimReview, type Finding } from "@/product-api";
import { track } from "@/product-api/analytics";
import {
  applyAnswer,
  evidenceLabel,
  orderedFields,
  toClaimPacketCsv,
  toClaimPacketJson,
} from "@/product-api/review";

export const Route = createFileRoute("/demo/review/$id")({
  component: ReviewPage,
  head: () => ({
    meta: [
      { title: "Claim preflight review | Warranty Flow" },
      {
        name: "description",
        content:
          "Evidence-linked facts, blockers, warnings and the exact missing-fact questions for one synthetic claim review.",
      },
      { property: "og:title", content: "Claim preflight review | Warranty Flow" },
      {
        property: "og:description",
        content:
          "Evidence-linked facts, blockers, warnings and the exact missing-fact questions for one synthetic claim review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function download(fileName: string, mediaType: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mediaType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ReviewPage() {
  const { id } = Route.useParams();
  const [review, setReview] = useState<ClaimReview | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getProductApi()
      .getReview(id)
      .then((found) => {
        if (!active) return;
        setReview(found);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const persist = useCallback(async (next: ClaimReview) => {
    await getProductApi().saveReview(next);
    setReview(next);
  }, []);

  if (!loaded) {
    return <p className="text-sm text-muted-foreground">Loading review…</p>;
  }

  if (!review) {
    return (
      <div className="space-y-6">
        <PageHead
          eyebrow="Review"
          title="This review is not in this browser"
          lead="Demo reviews are stored in localStorage on the device that created them. This record may have been deleted, or created elsewhere."
        />
        <Link to="/demo/new" className={buttonClass}>
          Start a new review
        </Link>
      </div>
    );
  }

  const preflight = review.preflight;
  const findings = preflight?.findings ?? [];
  const blockers = findings.filter((f) => f.severity === "blocker");
  const warnings = findings.filter((f) => f.severity === "warning");
  const confirmed = findings.filter((f) => f.severity === "confirmed");
  const fields = orderedFields(review.fields);
  const questions = preflight?.questions ?? [];

  async function rerun(nextFields: ClaimReview["fields"]) {
    if (!review) return;
    setBusy(true);
    try {
      const api = getProductApi();
      const result = await api.runPreflight({
        fields: nextFields,
        extractionStatus: review.extractionStatus,
      });
      track("preflight_completed", {
        mode: api.mode,
        reviewId: review.id,
        status: result.status,
        blockerCount: result.findings.filter((f) => f.severity === "blocker").length,
        warningCount: result.findings.filter((f) => f.severity === "warning").length,
        questionCount: result.questions.length,
      });
      if (result.status === "ready_for_dealer_review") {
        track("first_successful_outcome", {
          mode: api.mode,
          reviewId: review.id,
          outcome: result.status,
        });
      }
      await persist({
        ...review,
        fields: nextFields,
        preflight: result,
        updatedAt: new Date().toISOString(),
      });
      setAnswers({});
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswers() {
    if (!review) return;
    let nextFields = review.fields;
    for (const [key, value] of Object.entries(answers)) {
      if (!value.trim()) continue;
      nextFields = applyAnswer(nextFields, key as never, value, review.fileName);
    }
    await rerun(nextFields);
  }

  async function markReviewed() {
    if (!review) return;
    await persist({ ...review, reviewed: true, updatedAt: new Date().toISOString() });
  }

  function exportPacket(format: "json" | "csv") {
    if (!review) return;
    const base = review.fileName.replace(/\.[^.]+$/, "");
    if (format === "json")
      download(`${base}-claim-packet.json`, "application/json", toClaimPacketJson(review));
    else download(`${base}-claim-packet.csv`, "text/csv", toClaimPacketCsv(review));
    track("packet_exported", { mode: getProductApi().mode, reviewId: review.id, format });
  }

  const ready = preflight?.status === "ready_for_dealer_review";

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="Claim preflight"
        title={review.fileName}
        lead="Decision support only. This does not determine warranty eligibility and it does not submit anything to an OEM. Dealer-submit mode is the default."
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => exportPacket("json")}
            >
              Export JSON
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => exportPacket("csv")}
            >
              Export CSV
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => window.print()}>
              Print packet
            </button>
          </div>
        }
      />

      <div className="grid gap-px border border-border bg-border sm:grid-cols-5">
        {[
          ["Status", null],
          ["Facts", String(fields.length)],
          ["Blockers", String(blockers.length)],
          ["Warnings", String(warnings.length)],
          ["Dealer review", review.reviewed ? "Confirmed" : "Not confirmed"],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-background px-5 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            {value === null ? (
              <div className="mt-3">
                <StatusChip status={preflight?.status ?? "not_run"} />
              </div>
            ) : (
              <p className="mt-3 text-xl font-semibold tracking-tight">{value}</p>
            )}
          </div>
        ))}
      </div>

      {review.extractionNotes.length > 0 && (
        <Panel title="Extraction notes">
          <ul className="space-y-2 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
            {review.extractionNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Panel>
      )}

      {questions.length > 0 && (
        <Panel
          title={`Missing facts (${questions.length})`}
          description="Answer only what is genuinely known. Answers are recorded as dealer-supplied, not extracted."
        >
          <div className="space-y-5 px-5 py-5">
            {questions.map((question) => (
              <div key={question.field}>
                <label htmlFor={`answer-${question.field}`} className="block text-sm font-medium">
                  {question.label}
                </label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {question.question}
                </p>
                <input
                  id={`answer-${question.field}`}
                  value={answers[question.field] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [question.field]: event.target.value }))
                  }
                  className="mt-2 h-9 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={busy}
              onClick={() => void submitAnswers()}
            >
              {busy ? "Re-running checks…" : "Save answers and re-run checks"}
            </button>
          </div>
        </Panel>
      )}

      <Panel
        title="Facts and evidence"
        description="Every fact carries the file and page, row or line it came from, plus how it was obtained."
      >
        {fields.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No facts were extracted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Fact</th>
                  <th className="px-5 py-3 font-normal">Value</th>
                  <th className="px-5 py-3 font-normal">Source</th>
                  <th className="px-5 py-3 font-normal">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-border/70 align-top last:border-0">
                    <td className="px-5 py-3 font-medium">{field.label}</td>
                    <td className="px-5 py-3">{field.value}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {field.source}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {field.evidence.map((reference) => evidenceLabel(reference)).join(" · ") ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <FindingList title={`Blockers (${blockers.length})`} findings={blockers} />
      <FindingList title={`Warnings (${warnings.length})`} findings={warnings} />
      <FindingList title={`Confirmed facts (${confirmed.length})`} findings={confirmed} />

      <Panel title="Dealer review">
        <div className="px-5 py-5">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Confirming dealer review records that a person has checked the packet. It is available
            only once the deterministic checks return “Ready for dealer review”. Eligibility,
            coding, attestation, parts retention and submission remain the dealer&rsquo;s decisions.
          </p>
          <button
            type="button"
            className={`${buttonClass} mt-5`}
            disabled={!ready || review.reviewed}
            onClick={() => void markReviewed()}
          >
            {review.reviewed ? "Dealer review confirmed" : "Confirm dealer review"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function FindingList({ title, findings }: { title: string; findings: Finding[] }) {
  return (
    <Panel title={title}>
      {findings.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">None.</p>
      ) : (
        <ul className="divide-y divide-border">
          {findings.map((finding) => (
            <li key={finding.id} className="px-5 py-4">
              <p className="text-sm leading-relaxed">{finding.message}</p>
              {finding.question && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Question for the dealer: {finding.question}
                </p>
              )}
              {finding.evidence.length > 0 && (
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  {finding.evidence.map((reference) => evidenceLabel(reference)).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
