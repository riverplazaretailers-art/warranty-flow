import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { PageHead, Panel, buttonClass, secondaryButtonClass } from "@/components/demo/demo-ui";
import { getProductApi, type DocumentInput } from "@/product-api";
import { track } from "@/product-api/analytics";
import { createReviewFromExtraction } from "@/product-api/review";
import {
  SYNTHETIC_SAMPLE_CSV,
  SYNTHETIC_SAMPLE_CSV_FILENAME,
  SYNTHETIC_SAMPLE_FILENAME,
  SYNTHETIC_SAMPLE_TEXT,
} from "@/product-api/demo/samples";

export const Route = createFileRoute("/demo/new")({
  component: NewReview,
  head: () => ({
    meta: [
      { title: "Start a claim preflight | Warranty Flow" },
      {
        name: "description",
        content:
          "Load a synthetic repair order or a local PDF, TXT or CSV test file and run a browser-local claim preflight.",
      },
      { property: "og:title", content: "Start a claim preflight | Warranty Flow" },
      {
        property: "og:description",
        content:
          "Load a synthetic repair order or a local PDF, TXT or CSV test file and run a browser-local claim preflight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function encode(text: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(text);
  const buffer = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(buffer).set(encoded);
  return buffer;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

function NewReview() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(input: DocumentInput, label: string) {
    setBusy(label);
    setError(null);
    const api = getProductApi();
    try {
      track("claim_review_started", {
        mode: api.mode,
        workflow: "claim_preflight",
        synthetic: true,
      });
      track("document_uploaded", {
        mode: api.mode,
        fileType: extensionOf(input.fileName) || "unknown",
      });

      const extraction = await api.processDocument(input);
      track("extraction_completed", {
        mode: api.mode,
        status: extraction.status,
        fieldCount: extraction.fields.length,
      });

      const review = createReviewFromExtraction(extraction);
      review.preflight = await api.runPreflight({
        fields: review.fields,
        extractionStatus: review.extractionStatus,
      });
      track("preflight_completed", {
        mode: api.mode,
        reviewId: review.id,
        status: review.preflight.status,
        blockerCount: review.preflight.findings.filter((f) => f.severity === "blocker").length,
        warningCount: review.preflight.findings.filter((f) => f.severity === "warning").length,
        questionCount: review.preflight.questions.length,
      });

      await api.saveReview(review);
      await navigate({ to: "/demo/review/$id", params: { id: review.id } });
    } catch (cause) {
      track("workflow_failed", {
        mode: api.mode,
        workflow: "claim_preflight",
        reason: "processing_error",
      });
      setError(
        cause instanceof Error
          ? `This record could not be processed: ${cause.message}`
          : "This record could not be processed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function onFile(file: File) {
    const bytes = await file.arrayBuffer();
    await run({ fileName: file.name, mediaType: file.type, bytes }, "file");
  }

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow="New review"
        title="Start a claim preflight"
        lead="Processing happens in this browser. Nothing is uploaded to a server, and no claim data leaves this device."
      />

      <Panel className="bg-stone-warm">
        <div className="px-5 py-5 text-sm leading-relaxed text-muted-foreground">
          <strong className="font-medium text-foreground">Do not use real data.</strong> This is a
          synthetic demo workspace. Do not upload customer records, dealer production data, or
          OEM-confidential material. Use the synthetic samples or a file you have created for
          testing.
        </div>
      </Panel>

      {error && (
        <div
          role="alert"
          className="border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-px border border-border bg-border md:grid-cols-2">
        <div className="bg-background px-5 py-6">
          <h2 className="text-sm font-semibold tracking-tight">Incomplete repair order (TXT)</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            A synthetic work order missing meter hours, labor and the parts-retention
            acknowledgement. Produces exactly three missing-fact questions.
          </p>
          <button
            type="button"
            className={`${buttonClass} mt-5`}
            disabled={busy !== null}
            onClick={() =>
              void run(
                {
                  fileName: SYNTHETIC_SAMPLE_FILENAME,
                  mediaType: "text/plain",
                  bytes: encode(SYNTHETIC_SAMPLE_TEXT),
                },
                "txt",
              )
            }
          >
            {busy === "txt" ? "Processing…" : "Load incomplete sample"}
          </button>
        </div>

        <div className="bg-background px-5 py-6">
          <h2 className="text-sm font-semibold tracking-tight">Complete repair order (CSV)</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            A synthetic export with every required fact present. Reaches “Ready for dealer review”
            with no blockers.
          </p>
          <button
            type="button"
            className={`${buttonClass} mt-5`}
            disabled={busy !== null}
            onClick={() =>
              void run(
                {
                  fileName: SYNTHETIC_SAMPLE_CSV_FILENAME,
                  mediaType: "text/csv",
                  bytes: encode(SYNTHETIC_SAMPLE_CSV),
                },
                "csv",
              )
            }
          >
            {busy === "csv" ? "Processing…" : "Load complete sample"}
          </button>
        </div>
      </div>

      <Panel
        title="Use your own test file"
        description="PDF, TXT or CSV. A PDF with no text layer is reported as “OCR required” — it is never treated as an empty record."
      >
        <div className="px-5 py-6">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onFile(file);
            }}
          />
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={busy !== null}
            onClick={() => inputRef.current?.click()}
          >
            {busy === "file" ? "Processing…" : "Choose a local file"}
          </button>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Extraction and checks are decision support. They do not determine warranty eligibility
            and they do not submit anything to an OEM.
          </p>
        </div>
      </Panel>
    </div>
  );
}
