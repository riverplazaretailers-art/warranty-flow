import type { ClaimFieldKey } from "./types";

export interface FieldDefinition {
  key: ClaimFieldKey;
  label: string;
  /** Lower-case label aliases used to locate the fact in text or CSV headers. */
  aliases: string[];
  required: boolean;
  /** Exact question put back to the dealer when the fact is missing. */
  question: string;
  multiline?: boolean;
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: "roId",
    label: "Repair order / work order ID",
    aliases: ["ro", "ro #", "ro number", "repair order", "work order", "wo", "wo #", "work order id"],
    required: true,
    question: "What is the repair order (work order) number for this job?",
  },
  {
    key: "unitSerial",
    label: "Unit serial / PIN",
    aliases: ["serial", "serial number", "pin", "unit serial", "vin", "machine serial"],
    required: true,
    question: "What is the full unit serial number or PIN on the machine?",
  },
  {
    key: "failureDate",
    label: "Failure date",
    aliases: ["failure date", "date of failure", "fail date"],
    required: true,
    question: "On what date did the failure occur?",
  },
  {
    key: "repairDate",
    label: "Repair completion date",
    aliases: ["repair date", "repair completed", "completion date", "date completed", "closed date"],
    required: true,
    question: "On what date was the repair completed?",
  },
  {
    key: "meterHours",
    label: "Meter / hours",
    aliases: ["meter", "hours", "hour meter", "meter reading", "smu"],
    required: true,
    question: "What was the hour meter reading at the time of failure?",
  },
  {
    key: "complaint",
    label: "Complaint",
    aliases: ["complaint", "customer complaint", "reported issue"],
    required: true,
    question: "What did the customer report? Give the complaint in one sentence.",
    multiline: true,
  },
  {
    key: "cause",
    label: "Cause",
    aliases: ["cause", "root cause", "failure cause"],
    required: true,
    question: "What caused the failure? State the failed component and failure mode.",
    multiline: true,
  },
  {
    key: "correction",
    label: "Correction",
    aliases: ["correction", "repair performed", "work performed", "resolution"],
    required: true,
    question: "What corrective work was performed?",
    multiline: true,
  },
  {
    key: "causalPart",
    label: "Causal part number",
    aliases: ["causal part", "failed part", "causal part number", "primary failed part"],
    required: true,
    question: "Which part number is the causal part for this claim?",
  },
  {
    key: "parts",
    label: "Parts",
    aliases: ["parts", "parts used", "part lines", "parts total"],
    required: true,
    question: "List the parts (number and quantity) used on this repair.",
    multiline: true,
  },
  {
    key: "labor",
    label: "Labor",
    aliases: ["labor", "labour", "labor hours", "labor time", "flat rate"],
    required: true,
    question: "How many labor hours are being claimed, and against which operation code?",
  },
  {
    key: "authorizationRef",
    label: "Authorization / supporting document",
    aliases: [
      "authorization",
      "authorisation",
      "pre-authorization",
      "auth",
      "auth #",
      "authorization number",
      "supporting document",
    ],
    required: false,
    question:
      "Is there a pre-authorization number or supporting document reference for this repair? Enter it, or enter \"none required\".",
  },
  {
    key: "partsRetentionAck",
    label: "Parts retention acknowledgement",
    aliases: ["parts retention", "retention", "part retained", "core retained"],
    required: true,
    question:
      "Has the failed component been physically retained and tagged? Answer \"retained\", \"not required\", or \"scrapped\".",
  },
  {
    key: "priorClaimRef",
    label: "Prior / duplicate claim reference",
    aliases: ["prior claim", "previous claim", "duplicate claim", "related claim", "repeat repair"],
    required: false,
    question:
      "Is this repair related to a previous claim on the same unit? Enter the prior claim number, or \"none\".",
  },
];

export const FIELD_BY_KEY: Record<ClaimFieldKey, FieldDefinition> = Object.fromEntries(
  FIELD_DEFINITIONS.map((definition) => [definition.key, definition]),
) as Record<ClaimFieldKey, FieldDefinition>;

export function fieldLabel(key: ClaimFieldKey): string {
  return FIELD_BY_KEY[key]?.label ?? key;
}
