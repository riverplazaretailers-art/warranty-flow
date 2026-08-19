/**
 * Local deterministic preflight adapter for the pilot demo.
 *
 * All checks are declared here as data and executed by json-rules-engine.
 * React components must never contain claim rules.
 */
import { Engine, type RuleProperties } from "json-rules-engine";

import { FIELD_DEFINITIONS, FIELD_BY_KEY } from "../fields";
import type {
  ClaimField,
  ClaimFieldKey,
  EvidenceRef,
  ExtractionStatus,
  Finding,
  MissingFactQuestion,
  PreflightResult,
  PreflightStatus,
  WarrantyRuleEngine,
} from "../types";

interface RuleEvent {
  id: string;
  severity: "blocker" | "warning";
  field?: ClaimFieldKey;
  message: string;
}

const MIN_NARRATIVE_CHARS = 12;

function buildRules(): RuleProperties[] {
  const rules: RuleProperties[] = [];

  for (const definition of FIELD_DEFINITIONS) {
    if (!definition.required) {
      rules.push({
        conditions: {
          all: [{ fact: "present", path: `$.${definition.key}`, operator: "equal", value: false }],
        },
        event: {
          type: "finding",
          params: {
            id: `optional-missing-${definition.key}`,
            severity: "warning",
            field: definition.key,
            message: `${definition.label} was not found. Confirm it is genuinely not applicable before submission.`,
          } satisfies RuleEvent,
        },
      });
      continue;
    }
    rules.push({
      conditions: {
        all: [{ fact: "present", path: `$.${definition.key}`, operator: "equal", value: false }],
      },
      event: {
        type: "finding",
        params: {
          id: `required-missing-${definition.key}`,
          severity: "blocker",
          field: definition.key,
          message: `${definition.label} is required and was not found in the record.`,
        } satisfies RuleEvent,
      },
    });
  }

  for (const key of ["complaint", "cause", "correction"] as ClaimFieldKey[]) {
    rules.push({
      conditions: {
        all: [
          { fact: "present", path: `$.${key}`, operator: "equal", value: true },
          { fact: "thin", path: `$.${key}`, operator: "equal", value: true },
        ],
      },
      event: {
        type: "finding",
        params: {
          id: `thin-narrative-${key}`,
          severity: "warning",
          field: key,
          message: `${FIELD_BY_KEY[key].label} is very short. Complaint / cause / correction narratives are a common cause of correction requests.`,
        } satisfies RuleEvent,
      },
    });
  }

  rules.push({
    conditions: { all: [{ fact: "dateOrderInvalid", operator: "equal", value: true }] },
    event: {
      type: "finding",
      params: {
        id: "date-order",
        severity: "blocker",
        field: "repairDate",
        message: "Repair completion date is earlier than the failure date.",
      } satisfies RuleEvent,
    },
  });

  rules.push({
    conditions: { all: [{ fact: "causalPartNotInParts", operator: "equal", value: true }] },
    event: {
      type: "finding",
      params: {
        id: "causal-part-not-in-parts",
        severity: "warning",
        field: "causalPart",
        message: "The causal part number does not appear in the parts list on this record.",
      } satisfies RuleEvent,
    },
  });

  rules.push({
    conditions: { all: [{ fact: "partsRetentionUnclear", operator: "equal", value: true }] },
    event: {
      type: "finding",
      params: {
        id: "parts-retention-unclear",
        severity: "blocker",
        field: "partsRetentionAck",
        message:
          "Parts retention status is not a recognised answer. The dealer keeps physical custody and must confirm the failed component was retained, scrapped, or not required.",
      } satisfies RuleEvent,
    },
  });

  return rules;
}

function buildFacts(fields: ClaimField[]) {
  const byKey = new Map(fields.map((field) => [field.key, field.value.trim()]));
  const present: Record<string, boolean> = {};
  const thin: Record<string, boolean> = {};

  for (const definition of FIELD_DEFINITIONS) {
    const value = byKey.get(definition.key) ?? "";
    present[definition.key] = value.length > 0;
    thin[definition.key] = value.length > 0 && value.length < MIN_NARRATIVE_CHARS;
  }

  const failureDate = Date.parse(byKey.get("failureDate") ?? "");
  const repairDate = Date.parse(byKey.get("repairDate") ?? "");
  const dateOrderInvalid =
    Number.isFinite(failureDate) && Number.isFinite(repairDate) && repairDate < failureDate;

  const causalPart = (byKey.get("causalPart") ?? "").toUpperCase();
  const parts = (byKey.get("parts") ?? "").toUpperCase();
  const causalPartNotInParts =
    causalPart.length > 0 && parts.length > 0 && !parts.includes(causalPart);

  const retention = (byKey.get("partsRetentionAck") ?? "").toLowerCase();
  const partsRetentionUnclear =
    retention.length > 0 &&
    !["retain", "held", "tagged", "scrap", "not required", "n/a", "no retention"].some((token) =>
      retention.includes(token),
    );

  return { present, thin, dateOrderInvalid, causalPartNotInParts, partsRetentionUnclear };
}

export class LocalWarrantyRuleEngine implements WarrantyRuleEngine {
  readonly id = "json-rules-engine-local-pilot";

  async run(input: {
    fields: ClaimField[];
    extractionStatus: ExtractionStatus;
  }): Promise<PreflightResult> {
    const ranAt = new Date().toISOString();

    if (input.extractionStatus !== "extracted") {
      const status: PreflightStatus =
        input.extractionStatus === "ocr_required" ? "ocr_required" : "unsupported";
      return {
        status,
        ranAt,
        engineId: this.id,
        questions: [],
        findings: [
          {
            id: `extraction-${input.extractionStatus}`,
            severity: "blocker",
            message:
              status === "ocr_required"
                ? "The document has no readable text layer. Run OCR (or supply a text-bearing export) before preflight."
                : "The document type is not supported by this demo processor.",
            evidence: [],
          },
        ],
      };
    }

    const engine = new Engine(buildRules(), { allowUndefinedFacts: true });
    const { events } = await engine.run(buildFacts(input.fields));

    const evidenceFor = (key?: ClaimFieldKey): EvidenceRef[] =>
      key ? (input.fields.find((field) => field.key === key)?.evidence ?? []) : [];

    const findings: Finding[] = events.map((event) => {
      const params = event.params as unknown as RuleEvent;
      return {
        id: params.id,
        severity: params.severity,
        message: params.message,
        evidence: evidenceFor(params.field),
        ...(params.field ? { field: params.field } : {}),
        ...(params.severity === "blocker" && params.field
          ? { question: FIELD_BY_KEY[params.field].question }
          : {}),
      };
    });

    const flagged = new Set(findings.map((finding) => finding.field));
    for (const field of input.fields) {
      if (flagged.has(field.key) || !field.value.trim()) continue;
      findings.push({
        id: `confirmed-${field.key}`,
        severity: "confirmed",
        field: field.key,
        message: `${field.label}: ${field.value}`,
        evidence: field.evidence,
      });
    }

    const questions: MissingFactQuestion[] = findings
      .filter((finding) => finding.severity === "blocker" && finding.field)
      .map((finding) => ({
        field: finding.field as ClaimFieldKey,
        label: FIELD_BY_KEY[finding.field as ClaimFieldKey].label,
        question: FIELD_BY_KEY[finding.field as ClaimFieldKey].question,
      }));

    const hasBlockers = findings.some((finding) => finding.severity === "blocker");

    return {
      status: hasBlockers ? "needs_facts" : "ready_for_dealer_review",
      findings,
      questions,
      ranAt,
      engineId: this.id,
    };
  }
}
