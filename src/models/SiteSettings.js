const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Boost Vertex',
    },
    phone: {
      type: String,
      default: '03032799987',
    },
    email: {
      type: String,
      default: 'boostvertex@gmail.com',
    },
    salesEmail: {
      type: String,
      default: 'boostvertex@gmail.com',
    },
    whatsapp: {
      type: String,
      default: '03032799987',
    },
    address: {
      type: String,
      default: 'Blue Area, Islamabad, Pakistan',
    },
    workingHours: {
      type: String,
      default: 'Monday-Saturday, 10:00 AM-7:00 PM',
    },
    preferredContactMethod: {
      type: String,
      default: 'WhatsApp',
    },
    secondaryContactMethod: {
      type: String,
      default: 'Phone Call',
    },
    bookingUrl: {
      type: String,
      default: null,
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
