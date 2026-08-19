import { beforeEach, describe, expect, it } from "vitest";

import { LocalDocumentProcessor } from "@/product-api/demo/local-document-processor";
import { LocalWarrantyRuleEngine } from "@/product-api/demo/local-rule-engine";
import { createDemoProductApi } from "@/product-api/demo/demo-product-api";
import { SYNTHETIC_SAMPLE_FILENAME, SYNTHETIC_SAMPLE_TEXT } from "@/product-api/demo/samples";
import {
  applyAnswer,
  createReviewFromExtraction,
  toClaimPacketCsv,
  toClaimPacketJson,
} from "@/product-api/review";
import type { DocumentInput } from "@/product-api/types";

function input(fileName: string, mediaType: string, text: string): DocumentInput {
  const encoded = new TextEncoder().encode(text);
  const bytes = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(bytes).set(encoded);
  return { fileName, mediaType, bytes };
}

const processor = new LocalDocumentProcessor(async () => [{ page: 1, text: "" }]);
const engine = new LocalWarrantyRuleEngine();

async function incompleteReview() {
  const extraction = await processor.extract(
    input(SYNTHETIC_SAMPLE_FILENAME, "text/plain", SYNTHETIC_SAMPLE_TEXT),
  );
  const review = createReviewFromExtraction(extraction);
  review.preflight = await engine.run({
    fields: review.fields,
    extractionStatus: review.extractionStatus,
  });
  return review;
}

describe("answering missing facts", () => {
  it("changes status to ready once all three answers are supplied", async () => {
    const review = await incompleteReview();
    let fields = review.fields;
    fields = applyAnswer(fields, "meterHours", "1,204", review.fileName);
    fields = applyAnswer(fields, "labor", "4.1 hrs op 5410", review.fileName);
    fields = applyAnswer(fields, "partsRetentionAck", "retained and tagged", review.fileName);

    const result = await engine.run({ fields, extractionStatus: review.extractionStatus });
    expect(result.status).toBe("ready_for_dealer_review");
    expect(fields.find((field) => field.key === "labor")?.source).toBe("answered");
  });
});

describe("packet export", () => {
  it("serializes evidence references into JSON and CSV", async () => {
    const review = await incompleteReview();
    const json = JSON.parse(toClaimPacketJson(review)) as {
      dataClassification: string;
      fields: { key: string; evidence: { line?: number }[] }[];
    };
    expect(json.dataClassification).toBe("synthetic-demo");
    const ro = json.fields.find((field) => field.key === "roId");
    expect(ro?.evidence[0]?.line).toBeGreaterThan(0);

    const csv = toClaimPacketCsv(review);
    expect(csv.split("\n")[0]).toContain("evidence");
    expect(csv).toContain("RO-48812");
  });
});

describe("local history", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves, lists and deletes reviews in this browser only", async () => {
    const api = createDemoProductApi({ pdfTextExtractor: async () => [{ page: 1, text: "" }] });
    const review = await incompleteReview();
    await api.saveReview(review);
    expect(await api.listReviews()).toHaveLength(1);
    expect((await api.getReview(review.id))?.fileName).toBe(SYNTHETIC_SAMPLE_FILENAME);
    await api.deleteAllReviews();
    expect(await api.listReviews()).toHaveLength(0);
  });
});
