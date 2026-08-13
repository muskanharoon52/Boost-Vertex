/**
 * Shared frontend contracts for the future backend/API integration.
 * Keep these payloads stable when the real service layer is connected.
 */

export interface GrowthPlanLead {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyWebsite: string;
}

export interface NewsletterSubscription {
  email: string;
}

export type FastTrackAction = "call" | "chat" | "book" | "inquiry";

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  requestId?: string;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  requestId?: string;
}
