const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema(
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
    clientName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    challenge: {
      type: String,
      required: true,
    },
    solution: {
      type: String,
      required: true,
    },
    whatWeDid: String,
    capabilities: [{ type: String }],
    relatedServices: [{ type: String }],
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    cta: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    media: [{ type: String }],
    results: [
      {
        metric: String,
        description: String,
      },
    ],
    testimonial: String,
    seoTitle: String,
    seoDescription: String,
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaseStudy', caseStudySchema);
