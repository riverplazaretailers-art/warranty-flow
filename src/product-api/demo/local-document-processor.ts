/**
 * Local (browser / synthetic) document adapter.
 *
 * Isolated on purpose: pdfjs-dist and PapaParse are pilot-demo dependencies.
 * Production extraction runs in a separate portable service (see
 * docs/ARCHITECTURE.md) behind the same DocumentProcessor interface.
 */
import Papa from "papaparse";

import { FIELD_DEFINITIONS } from "../fields";
import type {
  ClaimField,
  DocumentInput,
  DocumentProcessor,
  EvidenceRef,
  ExtractionResult,
} from "../types";

export interface PdfPage {
  page: number;
  text: string;
}

/** Injectable so tests never need a real PDF binary. */
export type PdfTextExtractor = (bytes: ArrayBuffer) => Promise<PdfPage[]>;

const MIN_PDF_TEXT_CHARS = 40;

export async function defaultPdfTextExtractor(bytes: ArrayBuffer): Promise<PdfPage[]> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
  const pages: PdfPage[] = [];
  for (let page = 1; page <= doc.numPages; page++) {
    const content = await (await doc.getPage(page)).getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+\n/g, "\n");
    pages.push({ page, text });
  }
  return pages;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function cleanValue(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/^[:\-–]\s*/, "");
}

/** Label-based line scan. Returns a field per definition found, with line evidence. */
function extractFromLines(
  lines: string[],
  file: string,
  page?: number,
): ClaimField[] {
  const found: ClaimField[] = [];
  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const separatorIndex = line.search(/[:=]/);
    if (separatorIndex <= 0) return;
    const label = normalize(line.slice(0, separatorIndex));
    const value = cleanValue(line.slice(separatorIndex + 1));
    if (!value) return;

    for (const definition of FIELD_DEFINITIONS) {
      if (found.some((field) => field.key === definition.key)) continue;
      const matches = definition.aliases.some((alias) => normalize(alias) === label);
      if (!matches) continue;
      const evidence: EvidenceRef = {
        file,
        line: index + 1,
        snippet: line.slice(0, 160),
        ...(page !== undefined ? { page } : {}),
      };
      found.push({
        key: definition.key,
        label: definition.label,
        value,
        source: "extracted",
        evidence: [evidence],
      });
      break;
    }
  });
  return found;
}

function extractFromCsv(text: string, file: string): ClaimField[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  const rows = (parsed.data ?? []).filter(Boolean);
  const found: ClaimField[] = [];

  rows.forEach((row, rowIndex) => {
    for (const [header, rawValue] of Object.entries(row)) {
      const value = cleanValue(String(rawValue ?? ""));
      if (!value) continue;
      const label = normalize(header ?? "");
      for (const definition of FIELD_DEFINITIONS) {
        if (found.some((field) => field.key === definition.key)) continue;
        if (!definition.aliases.some((alias) => normalize(alias) === label)) continue;
        found.push({
          key: definition.key,
          label: definition.label,
          value,
          source: "extracted",
          evidence: [{ file, row: rowIndex + 2, snippet: `${header}: ${value}`.slice(0, 160) }],
        });
        break;
      }
    }
  });

  // Key/value shaped CSVs: "field,value" per row.
  if (found.length === 0) {
    const flat = Papa.parse<string[]>(text, { skipEmptyLines: true }).data ?? [];
    flat.forEach((cells, rowIndex) => {
      if (!Array.isArray(cells) || cells.length < 2) return;
      const label = normalize(String(cells[0] ?? ""));
      const value = cleanValue(String(cells[1] ?? ""));
      if (!value) return;
      for (const definition of FIELD_DEFINITIONS) {
        if (found.some((field) => field.key === definition.key)) continue;
        if (!definition.aliases.some((alias) => normalize(alias) === label)) continue;
        found.push({
          key: definition.key,
          label: definition.label,
          value,
          source: "extracted",
          evidence: [{ file, row: rowIndex + 1, snippet: cells.join(",").slice(0, 160) }],
        });
        break;
      }
    });
  }

  return found;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export class LocalDocumentProcessor implements DocumentProcessor {
  readonly id = "local-demo-processor";

  constructor(private readonly pdfTextExtractor: PdfTextExtractor = defaultPdfTextExtractor) {}

  supports(fileName: string, mediaType: string): boolean {
    const extension = extensionOf(fileName);
    return (
      ["pdf", "txt", "csv"].includes(extension) ||
      ["application/pdf", "text/plain", "text/csv"].includes(mediaType)
    );
  }

  async extract(input: DocumentInput): Promise<ExtractionResult> {
    const { fileName, mediaType, bytes } = input;
    const extension = extensionOf(fileName);

    if (!this.supports(fileName, mediaType)) {
      return {
        status: "unsupported",
        fileName,
        mediaType,
        fields: [],
        notes: [
          `This demo accepts PDF, TXT and CSV only. "${fileName}" was not processed.`,
        ],
      };
    }

    if (extension === "pdf" || mediaType === "application/pdf") {
      let pages: PdfPage[] = [];
      try {
        pages = await this.pdfTextExtractor(bytes);
      } catch {
        return {
          status: "unsupported",
          fileName,
          mediaType,
          fields: [],
          notes: ["The PDF could not be opened. It may be encrypted or damaged."],
        };
      }

      const totalChars = pages.reduce((sum, page) => sum + page.text.trim().length, 0);
      if (totalChars < MIN_PDF_TEXT_CHARS) {
        return {
          status: "ocr_required",
          fileName,
          mediaType,
          pageCount: pages.length,
          fields: [],
          notes: [
            "No usable text layer was found in this PDF. It is a scan or image, so OCR is required before extraction. Nothing was assumed from it.",
          ],
        };
      }

      const fields: ClaimField[] = [];
      for (const page of pages) {
        for (const field of extractFromLines(page.text.split(/\r?\n/), fileName, page.page)) {
          if (!fields.some((existing) => existing.key === field.key)) fields.push(field);
        }
      }
      return {
        status: "extracted",
        fileName,
        mediaType,
        pageCount: pages.length,
        fields,
        notes: [`Text layer read from ${pages.length} page(s).`],
      };
    }

    const text = new TextDecoder().decode(bytes);

    if (extension === "csv" || mediaType === "text/csv") {
      const fields = extractFromCsv(text, fileName);
      return {
        status: "extracted",
        fileName,
        mediaType,
        fields,
        notes: ["CSV parsed with row-level evidence references."],
      };
    }

    const fields = extractFromLines(text.split(/\r?\n/), fileName);
    return {
      status: "extracted",
      fileName,
      mediaType,
      fields,
      notes: ["Plain text parsed with line-level evidence references."],
    };
  }
}
