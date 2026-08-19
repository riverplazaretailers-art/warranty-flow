import { LocalDocumentProcessor, type PdfTextExtractor } from "./local-document-processor";
import { LocalWarrantyRuleEngine } from "./local-rule-engine";
import { clearReviews, readReviews, upsertReview } from "./local-store";
import type {
  Capabilities,
  ClaimReview,
  DocumentInput,
  ExtractionResult,
  PreflightResult,
  ProductApi,
} from "../types";

export const DEMO_CAPABILITIES: Capabilities = {
  claimPreflight: true,
  recoveryUpload: false,
  dmsIngestion: false,
  oemSubmission: false,
  reimbursementReconciliation: false,
};

export function createDemoProductApi(options: { pdfTextExtractor?: PdfTextExtractor } = {}): ProductApi {
  const processor = new LocalDocumentProcessor(options.pdfTextExtractor);
  const engine = new LocalWarrantyRuleEngine();

  return {
    mode: "demo",
    capabilities: DEMO_CAPABILITIES,

    async processDocument(input: DocumentInput): Promise<ExtractionResult> {
      return processor.extract(input);
    },

    async runPreflight(input): Promise<PreflightResult> {
      return engine.run(input);
    },

    async listReviews(): Promise<ClaimReview[]> {
      return readReviews();
    },

    async getReview(id: string): Promise<ClaimReview | null> {
      return readReviews().find((review) => review.id === id) ?? null;
    },

    async saveReview(review: ClaimReview): Promise<ClaimReview> {
      upsertReview(review);
      return review;
    },

    async deleteAllReviews(): Promise<void> {
      clearReviews();
    },
  };
}
