/**
 * Typed About-page CTA contract. The backend team can map these intent values
 * to CRM, calendar, and careers endpoints without changing the UI surface.
 */
import { apiRequest } from "./apiClient";
import type { ApiEnvelope } from "@/types/api";

export type AboutCtaIntent = "free-growth-plan" | "book-strategy-call" | "view-open-roles" | "start-project";

export interface AboutCtaRequest {
  intent: AboutCtaIntent;
  source: "about";
}

export const aboutService = {
  recordCtaIntent(payload: AboutCtaRequest) {
    return apiRequest<ApiEnvelope<{ received: boolean }>>("/about/cta", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
