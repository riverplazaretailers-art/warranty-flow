import { createDemoProductApi, DEMO_CAPABILITIES } from "./demo/demo-product-api";
import { createHttpProductApi, SUPPORTED_CONTRACT_VERSION } from "./http/http-product-api";
import type { Capabilities, ProductApi, RuntimeMode } from "./types";

export * from "./types";
export { FIELD_DEFINITIONS, FIELD_BY_KEY, fieldLabel } from "./fields";

function env(key: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof value === "string" ? value.trim() : "";
}

export interface RuntimeConfig {
  mode: RuntimeMode;
  reason: string;
  secureWorkspaceUrl: string;
  capabilities: Capabilities;
}

/**
 * Partial API configuration fails closed: a base URL alone is not "Live".
 */
export function resolveRuntimeConfig(): RuntimeConfig {
  const baseUrl = env("VITE_API_BASE_URL");
  const contractVersion = env("VITE_API_CONTRACT_VERSION");
  const secureWorkspaceUrl = env("VITE_SECURE_WORKSPACE_URL");

  if (baseUrl && contractVersion === SUPPORTED_CONTRACT_VERSION) {
    return {
      mode: "api",
      reason: "API base URL and a compatible contract version are configured.",
      secureWorkspaceUrl,
      capabilities: {
        claimPreflight: true,
        recoveryUpload: false,
        dmsIngestion: false,
        oemSubmission: false,
        reimbursementReconciliation: false,
      },
    };
  }

  if (secureWorkspaceUrl) {
    return {
      mode: "secure-link",
      reason: "Real work is handed off to the configured secure workspace.",
      secureWorkspaceUrl,
      capabilities: DEMO_CAPABILITIES,
    };
  }

  return {
    mode: "demo",
    reason: "No production API configuration present. Synthetic demo workspace only.",
    secureWorkspaceUrl: "",
    capabilities: DEMO_CAPABILITIES,
  };
}

let cached: ProductApi | undefined;

export function getProductApi(): ProductApi {
  if (cached) return cached;
  const config = resolveRuntimeConfig();
  cached =
    config.mode === "api"
      ? createHttpProductApi(env("VITE_API_BASE_URL"), config.capabilities)
      : createDemoProductApi();
  return cached;
}

export { createDemoProductApi, createHttpProductApi, DEMO_CAPABILITIES, SUPPORTED_CONTRACT_VERSION };
