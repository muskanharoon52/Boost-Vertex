// Blog List content contract: static Figma-matched editorial data that can swap to the content service API later.

import type { BlogPostContent } from "@/services/contentService";

export const blogCategories = ["All", "Strategy", "SEO", "Paid Media", "Content", "Web", "Growth", "Industry Insights"] as const;

export const blogPosts: BlogPostContent[] = [
  {
    id: "predictive-roas",
    slug: "scaling-roas-with-predictive-analytics",
    category: "Paid Media",
    title: "Scaling ROAS with Predictive Analytics",
    summary: "A deep dive into how machine learning models are redefining audience targeting and budget allocation for enterprise brands.",
    image: "/blog-server-analytics.jpg",
    readTime: "5 min read",
  },
  {
    id: "high-converting-landing-pages",
    slug: "anatomy-of-high-converting-landing-pages",
    category: "Growth",
    title: "The Anatomy of a High-Converting Landing Page",
    summary: "We analyzed 500+ B2B landing pages to uncover the exact structural elements that drive conversion rates above industry benchmarks.",
    image: "/blog-network-intelligence.jpg",
    readTime: "4 min read",
  },
  {
    id: "content-moats",
    slug: "building-content-moats-with-generative-ai",
    category: "Content",
    title: "Building Content Moats with Generative AI",
    summary: "How to develop proprietary viewpoints and original research that compounds.",
    image: "/blog-architecture-ai.jpg",
    readTime: "6 min read",
  },
  {
    id: "core-web-vitals",
    slug: "core-web-vitals-engineering-fast-experiences",
    category: "Web",
    title: "Core Web Vitals: Engineering Fast Experiences",
    summary: "A technical breakdown of how load times directly correlate with user outcomes.",
    image: "/blog-performance-device.jpg",
    readTime: "5 min read",
  },
  {
    id: "b2b-buyer-journeys",
    slug: "navigating-b2b-buyer-journeys-in-2026",
    category: "Strategy",
    title: "Navigating B2B Buyer Journeys in 2026",
    summary: "Understand the moments that shape enterprise purchase decisions and momentum.",
    image: "/blog-b2b-buyer-journeys.jpg",
    readTime: "4 min read",
  },
  {
    id: "technical-seo-audits",
    slug: "technical-seo-audits-finding-growth-levers",
    category: "SEO",
    title: "Technical SEO Audits: Finding Growth Levers",
    summary: "A comprehensive checklist for uncovering indexing issues and conversion friction.",
    image: "/blog-technical-seo-audits.jpg",
    readTime: "5 min read",
  },
];
