# Warranty Flow — Architecture

Warranty Flow is an independently deployable TwoRiverOps product. This repository
contains the product frontend and its typed product boundary. It does not contain,
and must not become, a cross-product runtime.

## Runtime modes

Exactly one mode is active at any time, resolved in `src/product-api/index.ts`:

| Mode | When | Behaviour |
| --- | --- | --- |
| `demo` | default, no production configuration | Synthetic, browser-local claim preflight. All records labelled synthetic. |
| `secure-link` | `VITE_SECURE_WORKSPACE_URL` set | Public/product/demo UI here; real work is handed to the preserved secure workspace. |
| `api` | `VITE_API_BASE_URL` **and** a compatible `VITE_API_CONTRACT_VERSION` | Calls the portable Warranty Flow service. |

Partial configuration fails closed. A base URL alone does not make an integration
"Live", and a broken live configuration never silently falls back to demo data.

## Boundaries

```
src/product-api/
  types.ts                     ProductApi, DocumentProcessor, WarrantyRuleEngine, evidence types
  fields.ts                    claim fact definitions, aliases and the exact missing-fact questions
  review.ts                    review construction, answer application, JSON/CSV packet serialization
  analytics.ts                 provider-neutral analytics with a strict allow-list sanitizer
  demo/                        ISOLATED synthetic/browser adapter (pdfjs-dist, PapaParse, json-rules-engine)
  http/                        portable service adapter (VITE_API_BASE_URL)
```

React components render state. They do not own extraction logic, claim rules,
thresholds, or evidence handling. Rules are declared as data in
`demo/local-rule-engine.ts` and executed by json-rules-engine.

## Document processing

The demo adapter (`demo/local-document-processor.ts`) runs entirely in the browser:

- **PDF** — pdfjs-dist text layer. If a PDF yields no usable text it returns
  `ocr_required`. It is never silently treated as empty.
- **CSV** — PapaParse, with row-level evidence references.
- **TXT** — label/line scan, with line-level evidence references.

Every extracted fact carries `EvidenceRef` values pointing at file, page, row, or
line, and those references survive answering, rerunning and export.

### Production document processing (not in this repository)

Production extraction belongs in a separate, portable service — a container the
product can deploy independently — using:

- **Docling** (MIT) — document structure and layout parsing
- **OCRmyPDF** (MPL-2.0) — OCR pass for scanned repair orders
- **Tesseract** (Apache-2.0) — OCR engine
- **RapidFuzz** (MIT) — fuzzy normalization of part numbers, op codes and narratives

Do **not** attempt to install Python packages into this frontend. The service is
reached through the existing `DocumentProcessor` / `ProductApi` contract, so the
UI does not change when it is introduced.

## Data

The only production data path in this repository is the existing Supabase-backed
pilot lead capture (`src/lib/pilot-leads.functions.ts` and its migrations). It is
preserved as-is. Demo claim reviews are stored in `localStorage` only and are
never sent anywhere.

No additional database tables and no production auth are enabled in the demo.

## Claims boundary

Dealer-submit mode is the default. Nothing in the product implies an OEM
integration, authorization, partnership or delegated submission right. Rules and
extracted fields are decision support; the dealer confirms facts, eligibility,
coding, attestation, submission and parts retention.

## Analytics

`analytics.ts` exposes a provider-neutral interface and instruments
`claim_review_started`, `document_uploaded`, `extraction_completed`,
`preflight_completed`, `first_successful_outcome`, `packet_exported`,
`workflow_failed`, `repeat_usage` and `pilot_request_submitted`. The sanitizer
allows only identifiers, counts and enum-like values — document text and claim
contents cannot be transmitted.

## Environment

See `.env.example`. No secrets belong in browser code.
