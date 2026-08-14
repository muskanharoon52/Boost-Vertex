const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Boost Vertex',
    },
    phone: {
      type: String,
      default: '+1 (555) 123-4567',
    },
    email: {
      type: String,
      default: 'hello@boostvertex.com',
    },
    address: {
      type: String,
      default: 'Your business address',
    },
    websiteUrl: {
      type: String,
      default: 'https://boostvertex.com',
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      x: String,
    },
    seoDefaults: {
      siteTitle: String,
      metaDescription: String,
      canonicalUrl: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
