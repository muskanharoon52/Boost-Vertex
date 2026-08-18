// Content-service contract: new Figma routes render local design content today and can swap to these typed backend requests without changing page UI.

import { apiRequest } from "./apiClient";
import type { ApiEnvelope } from "@/types/api";

export interface ServiceCardContent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon?: string;
  outcomes: string[];
  metricValue?: string;
  metricLabel?: string;
  accented?: boolean;
}

export interface ServiceDetailContent extends ServiceCardContent {
  eyebrow: string;
  heroTitle: string;
  heroEmphasis?: string;
  heroCopy: string;
  capabilities: Array<{ index: string; name: string; description: string }>;
  approachSteps: Array<{ index: string; title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export interface CaseStudyCardContent {
  id: string;
  slug: string;
  clientName: string;
  industry: string;
  metricValue: string;
  metricLabel: string;
  summary: string;
  services: string[];
}

export interface CaseStudyPage {
  items: CaseStudyCardContent[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export const contentService = {
  listServices() {
    return apiRequest<ApiEnvelope<ServiceCardContent[]>>("/services");
  },
  getService(slug: string) {
    return apiRequest<ApiEnvelope<ServiceDetailContent>>(`/services/${slug}`);
  },
  listCaseStudies(query = "") {
    return apiRequest<ApiEnvelope<CaseStudyPage>>(`/case-studies${query}`);
  },
  getCaseStudySummary() {
    return apiRequest<ApiEnvelope<{ adSpendManaged: string; averageRoi: string; clientRetention: string }>>("/case-studies/summary");
  },
};
