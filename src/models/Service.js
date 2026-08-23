const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [{ type: String }],
    whoNeedsThisService: String,
    problemsWeSolve: [{ type: String }],
    approach: [{ type: String }],
    deliverables: [{ type: String }],
    expectedOutcomes: [{ type: String }],
    benefits: [{ type: String }],
    faqs: [{ question: String, answer: String }],
    cta: String,
    primaryKeyword: String,
    secondaryKeywords: [{ type: String }],
    searchIntent: String,
    internalLinkingRecommendations: [{ type: String }],
    relatedCaseStudies: [{ type: String }],
    image: String,
    seoTitle: String,
    seoDescription: String,
    sortOrder: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
