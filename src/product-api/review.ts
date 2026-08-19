import { FIELD_DEFINITIONS, FIELD_BY_KEY } from "./fields";
import type {
  ClaimField,
  ClaimFieldKey,
  ClaimReview,
  ExtractionResult,
  PreflightStatus,
} from "./types";

export const STATUS_LABEL: Record<PreflightStatus, string> = {
  ready_for_dealer_review: "Ready for dealer review",
  needs_facts: "Needs facts",
  ocr_required: "OCR required",
  unsupported: "Unsupported",
};

export function newReviewId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `rev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function createReviewFromExtraction(extraction: ExtractionResult): ClaimReview {
  const now = new Date().toISOString();
  return {
    id: newReviewId(),
    createdAt: now,
    updatedAt: now,
    fileName: extraction.fileName,
    extractionStatus: extraction.status,
    extractionNotes: extraction.notes,
    fields: extraction.fields,
    preflight: null,
    reviewed: false,
    synthetic: true,
  };
}

/** Answering a missing fact is recorded as its own source, with no invented evidence. */
export function applyAnswer(
  fields: ClaimField[],
  key: ClaimFieldKey,
  value: string,
  fileName: string,
): ClaimField[] {
  const trimmed = value.trim();
  const next = fields.filter((field) => field.key !== key);
  if (!trimmed) return next;
  next.push({
    key,
    label: FIELD_BY_KEY[key].label,
    value: trimmed,
    source: "answered",
    evidence: [{ file: fileName, snippet: "Answered by dealer in review" }],
  });
  return next;
}

export function orderedFields(fields: ClaimField[]): ClaimField[] {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  return FIELD_DEFINITIONS.map((definition) => byKey.get(definition.key)).filter(
    (field): field is ClaimField => Boolean(field),
  );
}

export function evidenceLabel(reference: {
  page?: number;
  row?: number;
  line?: number;
  file: string;
}): string {
  if (reference.page !== undefined && reference.line !== undefined)
    return `${reference.file} · p${reference.page} · line ${reference.line}`;
  if (reference.page !== undefined) return `${reference.file} · p${reference.page}`;
  if (reference.row !== undefined) return `${reference.file} · row ${reference.row}`;
  if (reference.line !== undefined) return `${reference.file} · line ${reference.line}`;
  return reference.file;
}

export function toClaimPacketJson(review: ClaimReview): string {
  return JSON.stringify(
    {
      packet: "warranty-flow-claim-packet",
      version: 1,
      dataClassification: "synthetic-demo",
      review: {
        id: review.id,
        fileName: review.fileName,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        extractionStatus: review.extractionStatus,
        preflightStatus: review.preflight?.status ?? null,
        reviewed: review.reviewed,
      },
      fields: orderedFields(review.fields).map((field) => ({
        key: field.key,
        label: field.label,
        value: field.value,
        source: field.source,
        evidence: field.evidence,
      })),
      findings: review.preflight?.findings ?? [],
      questions: review.preflight?.questions ?? [],
    },
    null,
    2,
  );
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function toClaimPacketCsv(review: ClaimReview): string {
  const header = ["section", "key", "label", "value", "source_or_severity", "evidence"];
  const rows: string[][] = [];

  for (const field of orderedFields(review.fields)) {
    rows.push([
      "fact",
      field.key,
      field.label,
      field.value,
      field.source,
      field.evidence.map((reference) => evidenceLabel(reference)).join(" | "),
    ]);
  }

  for (const finding of review.preflight?.findings ?? []) {
    rows.push([
      "finding",
      finding.id,
      finding.field ? FIELD_BY_KEY[finding.field].label : "",
      finding.question ? `${finding.message} — ${finding.question}` : finding.message,
      finding.severity,
      finding.evidence.map((reference) => evidenceLabel(reference)).join(" | "),
    ]);
  }

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}
