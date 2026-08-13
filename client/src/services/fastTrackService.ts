/**
 * Fast Track action adapter. The current UI keeps its local interaction state;
 * this boundary is ready for call/chat/booking/inquiry service integrations.
 */

import { apiRequest } from "./apiClient";
import type { ApiEnvelope, FastTrackAction } from "@/types/api";

export function sendFastTrackAction(action: FastTrackAction) {
  return apiRequest<ApiEnvelope<{ accepted: boolean }>>("/fast-track", {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
