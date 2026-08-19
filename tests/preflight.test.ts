import { describe, expect, it } from "vitest";

import { LocalDocumentProcessor } from "@/product-api/demo/local-document-processor";
import { LocalWarrantyRuleEngine } from "@/product-api/demo/local-rule-engine";
import {
  SYNTHETIC_SAMPLE_CSV,
  SYNTHETIC_SAMPLE_CSV_FILENAME,
  SYNTHETIC_SAMPLE_FILENAME,
  SYNTHETIC_SAMPLE_TEXT,
} from "@/product-api/demo/samples";
import { sanitize } from "@/product-api/analytics";
import type { DocumentInput } from "@/product-api/types";

function input(fileName: string, mediaType: string, text: string): DocumentInput {
  const encoded = new TextEncoder().encode(text);
  const bytes = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(bytes).set(encoded);
  return { fileName, mediaType, bytes };
}

const processor = new LocalDocumentProcessor(async () => [{ page: 1, text: "" }]);
const engine = new LocalWarrantyRuleEngine();

describe("local document processor", () => {
  it("extracts TXT facts with line-level evidence", async () => {
    const result = await processor.extract(
      input(SYNTHETIC_SAMPLE_FILENAME, "text/plain", SYNTHETIC_SAMPLE_TEXT),
    );
    expect(result.status).toBe("extracted");
    const ro = result.fields.find((field) => field.key === "roId");
    expect(ro?.value).toBe("RO-48812");
    expect(ro?.source).toBe("extracted");
    expect(ro?.evidence[0]?.file).toBe(SYNTHETIC_SAMPLE_FILENAME);
    expect(ro?.evidence[0]?.line).toBeGreaterThan(0);
  });

  it("extracts CSV facts with row-level evidence", async () => {
    const result = await processor.extract(
      input(SYNTHETIC_SAMPLE_CSV_FILENAME, "text/csv", SYNTHETIC_SAMPLE_CSV),
    );
    expect(result.status).toBe("extracted");
    expect(result.fields.find((field) => field.key === "labor")?.evidence[0]?.row).toBe(2);
  });

  it("fails closed with OCR required when a PDF has no text layer", async () => {
    const result = await processor.extract(input("scan.pdf", "application/pdf", "%PDF-1.4"));
    expect(result.status).toBe("ocr_required");
    expect(result.fields).toHaveLength(0);
  });

  it("reports unsupported formats instead of guessing", async () => {
    const result = await processor.extract(input("photo.png", "image/png", "x"));
    expect(result.status).toBe("unsupported");
    expect(result.fields).toHaveLength(0);
  });
});

describe("deterministic preflight", () => {
  it("asks exactly the three missing facts on the incomplete sample", async () => {
    const extraction = await processor.extract(
      input(SYNTHETIC_SAMPLE_FILENAME, "text/plain", SYNTHETIC_SAMPLE_TEXT),
    );
    const result = await engine.run({
      fields: extraction.fields,
      extractionStatus: extraction.status,
    });
    expect(result.status).toBe("needs_facts");
    expect(result.questions.map((question) => question.field).sort()).toEqual([
      "labor",
      "meterHours",
      "partsRetentionAck",
    ]);
  });

  it("marks the complete CSV sample ready for dealer review", async () => {
    const extraction = await processor.extract(
      input(SYNTHETIC_SAMPLE_CSV_FILENAME, "text/csv", SYNTHETIC_SAMPLE_CSV),
    );
    const result = await engine.run({
      fields: extraction.fields,
      extractionStatus: extraction.status,
    });
    expect(result.status).toBe("ready_for_dealer_review");
    expect(result.questions).toHaveLength(0);
  });

  it("propagates OCR required through preflight", async () => {
    const result = await engine.run({ fields: [], extractionStatus: "ocr_required" });
    expect(result.status).toBe("ocr_required");
    expect(result.questions).toHaveLength(0);
  });
});

describe("analytics sanitizer", () => {
  it("drops claim content and keeps allow-listed metadata", () => {
    const clean = sanitize({
      status: "needs_facts",
      fieldCount: 8,
      complaint: "Operator reports loss of hydraulic lift power",
      unitSerial: "SYN0X4412298",
      serial: "SYN0X4412298",
    });
    expect(clean).toEqual({ status: "needs_facts", fieldCount: 8 });
  });
});
