/**
 * Lead-capture and newsletter adapters. Wire these functions to the backend
 * routes documented in backend/api/README.md when the services are ready.
 */

import { apiRequest } from "./apiClient";
import type { ApiEnvelope, GrowthPlanLead, NewsletterSubscription } from "@/types/api";

export const contactService = {
  submitGrowthPlan(payload: GrowthPlanLead) {
    return apiRequest<ApiEnvelope<{ leadId: string }>>("/leads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  subscribe(payload: NewsletterSubscription) {
    return apiRequest<ApiEnvelope<{ subscriptionId: string }>>("/newsletter", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
