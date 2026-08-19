/**
 * HTTP adapter for the portable Warranty Flow service.
 *
 * Only used when BOTH VITE_API_BASE_URL and a compatible
 * VITE_API_CONTRACT_VERSION are configured. Partial configuration fails
 * closed — it never silently falls back to demo data.
 */
import type {
  Capabilities,
  ClaimReview,
  DocumentInput,
  ExtractionResult,
  PreflightResult,
  ProductApi,
} from "../types";

export const SUPPORTED_CONTRACT_VERSION = "2026-08-01";

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-api-contract-version": SUPPORTED_CONTRACT_VERSION,
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Warranty Flow API ${response.status} on ${path}`);
  return (await response.json()) as T;
}

export function createHttpProductApi(baseUrl: string, capabilities: Capabilities): ProductApi {
  return {
    mode: "api",
    capabilities,

    processDocument: (input: DocumentInput) =>
      request<ExtractionResult>(baseUrl, "/documents/extract", {
        method: "POST",
        body: JSON.stringify({
          fileName: input.fileName,
          mediaType: input.mediaType,
          bytes: Array.from(new Uint8Array(input.bytes)),
        }),
      }),

    runPreflight: (input) =>
      request<PreflightResult>(baseUrl, "/preflight", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    listReviews: () => request<ClaimReview[]>(baseUrl, "/reviews"),

    getReview: (id) => request<ClaimReview | null>(baseUrl, `/reviews/${encodeURIComponent(id)}`),

    saveReview: (review) =>
      request<ClaimReview>(baseUrl, `/reviews/${encodeURIComponent(review.id)}`, {
        method: "PUT",
        body: JSON.stringify(review),
      }),

    deleteAllReviews: async () => {
      await request<unknown>(baseUrl, "/reviews", { method: "DELETE" });
    },
  };
}
