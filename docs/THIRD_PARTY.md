# Third-party components

What Warranty Flow reuses, under what licence, and what TwoRiverOps still has to build.
Nothing here implies an endorsement or partnership by any of these projects.

## In this frontend (pilot demo adapter)

| Component | Link | Capability | Licence | What we reuse | What TwoRiverOps must add |
| --- | --- | --- | --- | --- | --- |
| pdfjs-dist | https://github.com/mozilla/pdf.js | PDF text-layer extraction in the browser | Apache-2.0 | Page text and page numbers for evidence references | Detection of scanned/no-text PDFs, field location, evidence lineage |
| PapaParse | https://www.papaparse.com | CSV parsing | MIT | Header and row parsing | Column-to-claim-fact mapping, row-level evidence |
| json-rules-engine | https://github.com/CacheControl/json-rules-engine | Deterministic rule evaluation | ISC | Rule condition/event execution | The warranty rule set, severities, exact missing-fact questions |
| Zod | https://zod.dev | Input validation | MIT | Pilot lead schema validation | Field-level business validation |
| TanStack Start / Router / Query | https://tanstack.com | App runtime, routing, data | MIT | Framework | Product workflow |
| Tailwind CSS + shadcn/ui | https://tailwindcss.com | Styling and primitives | MIT | Design primitives | TwoRiverOps visual language and density |

## Production document-processing service (separate, portable — not installed here)

| Component | Link | Capability | Licence | What we reuse | What TwoRiverOps must add |
| --- | --- | --- | --- | --- | --- |
| Docling | https://github.com/docling-project/docling | Document structure/layout parsing | MIT | Layout-aware document model | Warranty-specific field extraction, confidence, provenance |
| OCRmyPDF | https://github.com/ocrmypdf/OCRmyPDF | Adds a text layer to scanned PDFs | MPL-2.0 | OCR pipeline orchestration | Queueing, retention policy, page-level evidence mapping |
| Tesseract | https://github.com/tesseract-ocr/tesseract | OCR engine | Apache-2.0 | Character recognition | Quality gating and "OCR required" thresholds |
| RapidFuzz | https://github.com/rapidfuzz/RapidFuzz | Fuzzy string matching | MIT | Normalization of part numbers, op codes, narratives | OEM-specific dictionaries and match thresholds |

These four run in a containerised Python service. They are **not** installed into
this Lovable frontend; they are reached through the `DocumentProcessor` contract.

## Not used

No OEM software, OEM branding, OEM portal automation, or dealer management system
integration is present. DMS ingestion, OEM portal submission and reimbursement
reconciliation are planned and approval-dependent.
