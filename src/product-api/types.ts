/**
 * Typed product boundary for Warranty Flow.
 *
 * Nothing in this file knows about React, Supabase, pdfjs, PapaParse or
 * json-rules-engine. Adapters live in ./demo (browser/synthetic pilot) and
 * ./http (future portable service configured by VITE_API_BASE_URL).
 */

export type RuntimeMode = "demo" | "secure-link" | "api";

export interface Capabilities {
  /** Local deterministic claim preflight (working in the demo). */
  claimPreflight: boolean;
  /** Recovery / leakage-audit upload. Pilot service, not enabled in demo. */
  recoveryUpload: boolean;
  /** DMS ingestion. Approval dependent. */
  dmsIngestion: boolean;
  /** OEM portal submission. Approval dependent. */
  oemSubmission: boolean;
  /** Reimbursement reconciliation feed. Approval dependent. */
  reimbursementReconciliation: boolean;
}

/* ------------------------------------------------------------------ facts */

export type ClaimFieldKey =
  | "roId"
  | "unitSerial"
  | "repairDate"
  | "failureDate"
  | "meterHours"
  | "complaint"
  | "cause"
  | "correction"
  | "causalPart"
  | "parts"
  | "labor"
  | "authorizationRef"
  | "partsRetentionAck"
  | "priorClaimRef";

export type FieldSource = "extracted" | "answered" | "sample";

/** Where a fact or finding came from. File/page/row/line where available. */
export interface EvidenceRef {
  file: string;
  page?: number;
  row?: number;
  line?: number;
  snippet?: string;
}

export interface ClaimField {
  key: ClaimFieldKey;
  label: string;
  value: string;
  source: FieldSource;
  evidence: EvidenceRef[];
}

/* ------------------------------------------------------- document processing */

export interface DocumentInput {
  fileName: string;
  mediaType: string;
  /** Raw bytes. Text is decoded by the adapter, never by UI code. */
  bytes: ArrayBuffer;
}

export type ExtractionStatus = "extracted" | "ocr_required" | "unsupported";

export interface ExtractionResult {
  status: ExtractionStatus;
  fileName: string;
  mediaType: string;
  /** Only fields the adapter could actually locate. */
  fields: ClaimField[];
  /** Operator-facing notes, e.g. why OCR is required. */
  notes: string[];
  pageCount?: number;
}

export interface DocumentProcessor {
  readonly id: string;
  supports(fileName: string, mediaType: string): boolean;
  extract(input: DocumentInput): Promise<ExtractionResult>;
}

/* ------------------------------------------------------------ rule engine */

export type PreflightStatus =
  | "ready_for_dealer_review"
  | "needs_facts"
  | "ocr_required"
  | "unsupported";

export type FindingSeverity = "blocker" | "warning" | "confirmed";

export interface Finding {
  id: string;
  severity: FindingSeverity;
  field?: ClaimFieldKey;
  message: string;
  /** Exact question to put back to the dealer, for blockers. */
  question?: string;
  evidence: EvidenceRef[];
}

export interface MissingFactQuestion {
  field: ClaimFieldKey;
  label: string;
  question: string;
}

export interface PreflightResult {
  status: PreflightStatus;
  findings: Finding[];
  questions: MissingFactQuestion[];
  ranAt: string;
  engineId: string;
}

export interface WarrantyRuleEngine {
  readonly id: string;
  run(input: {
    fields: ClaimField[];
    extractionStatus: ExtractionStatus;
  }): Promise<PreflightResult>;
}

/* -------------------------------------------------------------- reviews */

export interface ClaimReview {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  extractionStatus: ExtractionStatus;
  extractionNotes: string[];
  fields: ClaimField[];
  preflight: PreflightResult | null;
  reviewed: boolean;
  synthetic: true;
}

/* ------------------------------------------------------------ product api */

export interface ProductApi {
  readonly mode: RuntimeMode;
  readonly capabilities: Capabilities;
  processDocument(input: DocumentInput): Promise<ExtractionResult>;
  runPreflight(input: {
    fields: ClaimField[];
    extractionStatus: ExtractionStatus;
  }): Promise<PreflightResult>;
  listReviews(): Promise<ClaimReview[]>;
  getReview(id: string): Promise<ClaimReview | null>;
  saveReview(review: ClaimReview): Promise<ClaimReview>;
  deleteAllReviews(): Promise<void>;
}
