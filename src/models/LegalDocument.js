const mongoose = require('mongoose');

const legalDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['privacy-policy', 'terms', 'cookie-policy', 'disclaimer'],
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    effectiveDate: Date,
    isPublished: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LegalDocument', legalDocumentSchema);