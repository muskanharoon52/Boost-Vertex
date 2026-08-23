const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['homepage', 'about'], required: true, unique: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);