const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    relatedServices: [{ type: String }],
    relatedClients: [{ type: String }],
    relatedCaseStudies: [{ type: String }],
    seoTitle: String,
    seoDescription: String,
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Industry', industrySchema);