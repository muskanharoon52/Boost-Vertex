// Marketing content contract: Figma-referenced preview content mirrors the future API shapes in contentService.ts.

import type { CaseStudyCardContent, ServiceCardContent, ServiceDetailContent } from "@/services/contentService";

export const services: ServiceCardContent[] = [
  { id: "service-01", slug: "technical-content-seo", title: "Technical & Content SEO", summary: "Dominate search results with structural optimization and high-intent content strategies that drive compounding organic traffic.", outcomes: ["Technical Audits & Core Web Vitals", "High-Intent Keyword Strategy", "Programmatic SEO Builds"], metricValue: "Avg. +138% Organic Traffic", metricLabel: "SEO growth" },
  { id: "service-02", slug: "paid-social-meta-ads", title: "Paid Social & Meta Ads", summary: "Hyper-targeted creative and data-driven media buying designed to acquire customers profitably at scale.", outcomes: ["Advanced Audience Architecture", "Rapid Creative Testing", "Full-Funnel Retargeting"], metricValue: "Avg. +49% ROAS", metricLabel: "media return", accented: true },
  { id: "service-03", slug: "search-performance-max", title: "Search & Performance Max", summary: "Capture high-intent demand precisely when your customers are ready to buy, minimizing wasted spend.", outcomes: ["Intent-Based Search Campaigns", "PMax Feed Optimization", "Competitor Conquesting"], metricValue: "Avg. -32% CPA", metricLabel: "acquisition cost" },
  { id: "service-04", slug: "conversion-led-web-design", title: "Conversion-Led Web Design", summary: "High-performance landing pages and digital experiences engineered specifically for measurable conversion rates.", outcomes: ["Frictionless UX/UI Design", "A/B Split Testing Protocols", "Sub-Second Load Times"], metricValue: "Avg. +36% CVR", metricLabel: "conversion rate" },
  { id: "service-05", slug: "b2b-lead-generation", title: "B2B Lead Generation", summary: "Predictable pipeline generation combining outbound systems with inbound content to fill your calendar with qualified buyers.", outcomes: ["Multi-Channel Outbound", "Lead Magnet Engineering", "CRM Integration & Automation"], metricValue: "Consistent SQL Flow", metricLabel: "pipeline quality", accented: true },
  { id: "service-06", slug: "data-analytics", title: "Data & Analytics", summary: "Clear visibility into what drives revenue. We connect the dots across your entire attribution stack.", outcomes: ["Server-Side Tracking Setup", "Custom KPI Dashboards", "LTV vs Content Analysis"], metricValue: "Data-Driven", metricLabel: "decisions" },
];

export const caseStudies: CaseStudyCardContent[] = [
  { id: "case-01", slug: "nexus-capital-partners", clientName: "Nexus Capital Partners", industry: "Fintech", metricValue: "+412%", metricLabel: "Organic Traffic", summary: "Dominating competitive financial SERPs through technical infrastructure overhaul and authority building.", services: ["SEO", "Content"] },
  { id: "case-02", slug: "cloudsync-tech", clientName: "CloudSync Tech", industry: "SaaS", metricValue: "+185%", metricLabel: "Lead Volume", summary: "Restructuring ad accounts to target high-intent enterprise buyers, reducing wasted spend.", services: ["Paid Social", "Landing Pages"] },
  { id: "case-03", slug: "lumina-retail", clientName: "Lumina Retail", industry: "E-commerce", metricValue: "+2.4%", metricLabel: "Conversion Rate", summary: "Frictionless checkout redesign utilizing heat mapping and A/B multivariate testing.", services: ["Web Design", "CRO"] },
  { id: "case-04", slug: "vitalis-health-net", clientName: "Vitalis Health Net", industry: "Healthcare", metricValue: "+89%", metricLabel: "MQL Growth", summary: "Establishing topical authority in a YMYL niche through expert-reviewed comprehensive content clusters.", services: ["SEO", "Content"] },
  { id: "case-05", slug: "apex-freight", clientName: "Apex Freight", industry: "Logistics", metricValue: "-45%", metricLabel: "Cost Per Lead", summary: "Optimized paid search campaigns to target enterprise logistics contacts, reducing wasted ad spend.", services: ["Search", "Analytics"] },
  { id: "case-06", slug: "learnsphere", clientName: "LearnSphere", industry: "EdTech", metricValue: "3.2x", metricLabel: "User Acquisition", summary: "Multi-channel social strategy combined with high-value lead magnets to accelerate user sign-ups.", services: ["Paid Social", "Creative"] },
  { id: "case-07", slug: "northstar-finance", clientName: "Northstar Finance", industry: "Fintech", metricValue: "+124%", metricLabel: "Qualified Leads", summary: "Compliance-aware acquisition system built around high-intent audience signals.", services: ["SEO", "Search"] },
  { id: "case-08", slug: "harborline", clientName: "Harborline", industry: "Real Estate", metricValue: "4.1x", metricLabel: "Pipeline ROI", summary: "Local market targeting and performance reporting connected marketing investment to pipeline.", services: ["Analytics", "Search"] },
  { id: "case-09", slug: "fieldcraft", clientName: "Fieldcraft", industry: "B2B", metricValue: "+62%", metricLabel: "SQL Rate", summary: "Content-led outbound program introduced a consistent qualified-sales-opportunity flow.", services: ["Outbound", "Content"] },
];

const baseCapabilities = [
  { index: "01", name: "Foundation & structure", description: "A durable architecture that makes each campaign, asset, and decision easier to compound." },
  { index: "02", name: "Precision execution", description: "Channel-specific systems built around the audience, intent, and measurement model that matters." },
  { index: "03", name: "Continuous testing", description: "Structured experiments that identify the right growth levers without wasting budget." },
  { index: "04", name: "Conversion mechanics", description: "Every experience is engineered to turn qualified attention into measurable action." },
  { index: "05", name: "Transparent intelligence", description: "Clean reporting connects activity to the decisions that move revenue forward." },
];

export function getServiceDetail(slug?: string): ServiceDetailContent {
  const service = services.find((item) => item.slug === slug) ?? services[2];
  return {
    ...service,
    eyebrow: "SERVICE DETAIL",
    heroTitle: `${service.title} focused performance.`,
    heroEmphasis: "Built to compound.",
    heroCopy: `We combine the systems, creative discipline, and measurement rigor behind ${service.title.toLowerCase()} so performance improves with every cycle—not just every launch.`,
    capabilities: baseCapabilities,
    approachSteps: [
      { index: "01", title: "Audit", description: "Deep analysis of your current performance baseline and measurement quality." },
      { index: "02", title: "Strategy", description: "A clear architecture connecting goals, audience, assets, and channels." },
      { index: "03", title: "Build", description: "Asset creation, tracking implementation, and campaign infrastructure." },
      { index: "04", title: "Launch", description: "Controlled activation with accurate monitoring from the first live signal." },
      { index: "05", title: "Test", description: "A/B stress testing across creative, targeting, messaging, and conversion." },
      { index: "06", title: "Optimize", description: "Continuous calibration around the opportunities that have proven impact." },
      { index: "07", title: "Scale", description: "Velocity multiplication when the system demonstrates repeatable returns." },
    ],
    faqs: [
      { question: "How long until we see measurable results?", answer: "The baseline and buying cycle determine timing. We set leading indicators early and optimize toward durable outcomes." },
      { question: "Do you work with our existing infrastructure?", answer: "Yes. The delivery plan begins with an audit of the systems, data, and teams already in place." },
      { question: "What does transparent reporting look like?", answer: "A concise performance view that connects channel activity to agreed business outcomes and next actions." },
      { question: "Can this service integrate with our internal team?", answer: "Yes. We work as an extension of the team, with clear ownership and shared weekly operating rhythm." },
    ],
  };
}
