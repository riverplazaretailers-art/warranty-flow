/**
 * Provider-neutral analytics boundary.
 *
 * Only identifiers, counts and enum-like values are permitted. Document text,
 * claim narratives, serial numbers, part numbers and personal data must never
 * be passed here — the sanitizer drops anything that is not on the allow-list.
 */

export type AnalyticsEvent =
  | "claim_review_started"
  | "document_uploaded"
  | "extraction_completed"
  | "preflight_completed"
  | "first_successful_outcome"
  | "packet_exported"
  | "workflow_failed"
  | "repeat_usage"
  | "pilot_request_submitted";

export type AnalyticsValue = string | number | boolean;

const ALLOWED_KEYS = [
  "product",
  "mode",
  "workflow",
  "reviewId",
  "accountId",
  "status",
  "outcome",
  "fileType",
  "fieldCount",
  "blockerCount",
  "warningCount",
  "questionCount",
  "reviewCount",
  "format",
  "reason",
  "synthetic",
] as const;

export type AnalyticsProps = Partial<Record<(typeof ALLOWED_KEYS)[number], AnalyticsValue>>;

export interface AnalyticsProvider {
  readonly id: string;
  track(event: AnalyticsEvent, props: AnalyticsProps): void;
}

export function sanitize(props: Record<string, unknown>): AnalyticsProps {
  const clean: Record<string, AnalyticsValue> = {};
  for (const key of ALLOWED_KEYS) {
    const value = props[key];
    if (typeof value === "string") clean[key] = value.slice(0, 64);
    else if (typeof value === "number" || typeof value === "boolean") clean[key] = value;
  }
  return clean;
}

export const noopAnalytics: AnalyticsProvider = {
  id: "noop",
  track: () => {},
};

/** Default pilot provider: logs locally, transmits nothing. */
export const consoleAnalytics: AnalyticsProvider = {
  id: "console",
  track: (event, props) => {
    if (typeof window === "undefined") return;
    console.info(`[analytics] ${event}`, props);
  },
};

let provider: AnalyticsProvider = consoleAnalytics;

export function setAnalyticsProvider(next: AnalyticsProvider) {
  provider = next;
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  provider.track(event, sanitize({ product: "warranty-flow", ...props }));
}
