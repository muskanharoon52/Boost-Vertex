const SiteSettings = require('../models/SiteSettings');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{6,20}$/;

const trimString = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value.trim();
};

const validateEmail = (value, fieldName) => {
  const email = trimString(value, fieldName).toLowerCase();
  if (!emailPattern.test(email)) throw new Error(`${fieldName} must be a valid email`);
  return email;
};

const validatePhone = (value, fieldName) => {
  const phone = trimString(value, fieldName);
  if (!phonePattern.test(phone)) throw new Error(`${fieldName} must be a valid phone number`);
  return phone;
};

const validateUrl = (value, fieldName, nullable = false) => {
  if (nullable && (value === null || value === '')) return null;
  const url = trimString(value, fieldName);

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
  } catch (error) {
    throw new Error(`${fieldName} must be a valid HTTP or HTTPS URL`);
  }

  return url;
};

const normalizeOptionalUrl = (value, fieldName) => {
  if (typeof value === 'undefined') return undefined;
  return validateUrl(value, fieldName, true);
};

const normalizeSiteSettingsPayload = (payload = {}) => {
  const normalized = {};
  const stringFields = [
    'companyName',
    'address',
    'workingHours',
    'preferredContactMethod',
    'secondaryContactMethod',
  ];

  stringFields.forEach((fieldName) => {
    if (typeof payload[fieldName] !== 'undefined') normalized[fieldName] = trimString(payload[fieldName], fieldName);
  });

  if (typeof payload.phone !== 'undefined') normalized.phone = validatePhone(payload.phone, 'Phone');
  if (typeof payload.whatsapp !== 'undefined') normalized.whatsapp = validatePhone(payload.whatsapp, 'WhatsApp');
  if (typeof payload.email !== 'undefined') normalized.email = validateEmail(payload.email, 'Email');
  if (typeof payload.salesEmail !== 'undefined') normalized.salesEmail = validateEmail(payload.salesEmail, 'Sales email');
  if (typeof payload.websiteUrl !== 'undefined') normalized.websiteUrl = validateUrl(payload.websiteUrl, 'Website URL');
  if (typeof payload.bookingUrl !== 'undefined') normalized.bookingUrl = normalizeOptionalUrl(payload.bookingUrl, 'Booking URL');

  if (typeof payload.socialLinks !== 'undefined') {
    if (!payload.socialLinks || typeof payload.socialLinks !== 'object' || Array.isArray(payload.socialLinks)) {
      throw new Error('Social links must be an object');
    }

    normalized.socialLinks = {};
    ['facebook', 'instagram', 'linkedin', 'x'].forEach((platform) => {
      if (typeof payload.socialLinks[platform] !== 'undefined') {
        normalized.socialLinks[platform] = normalizeOptionalUrl(payload.socialLinks[platform], `${platform} social link`);
      }
    });
  }

  if (typeof payload.seoDefaults !== 'undefined') {
    if (!payload.seoDefaults || typeof payload.seoDefaults !== 'object' || Array.isArray(payload.seoDefaults)) {
      throw new Error('SEO defaults must be an object');
    }

    normalized.seoDefaults = {};
    ['siteTitle', 'metaDescription'].forEach((fieldName) => {
      if (typeof payload.seoDefaults[fieldName] !== 'undefined') {
        normalized.seoDefaults[fieldName] = trimString(payload.seoDefaults[fieldName], fieldName);
      }
    });
    if (typeof payload.seoDefaults.canonicalUrl !== 'undefined') {
      normalized.seoDefaults.canonicalUrl = normalizeOptionalUrl(payload.seoDefaults.canonicalUrl, 'Canonical URL');
    }
  }

  return normalized;
};

const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch site settings' });
  }
};

const updateSiteSettings = async (req, res) => {
  try {
    const payload = normalizeSiteSettingsPayload(req.body);
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(payload);
      return res.status(201).json({ message: 'Site settings created', settings });
    }

    if (payload.socialLinks) {
      payload.socialLinks = {
        ...(settings.socialLinks ? settings.socialLinks.toObject() : {}),
        ...payload.socialLinks,
      };
    }

    if (payload.seoDefaults) {
      payload.seoDefaults = {
        ...(settings.seoDefaults ? settings.seoDefaults.toObject() : {}),
        ...payload.seoDefaults,
      };
    }

    settings = await SiteSettings.findByIdAndUpdate(settings._id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: 'Site settings updated', settings });
  } catch (error) {
    if (/must be|valid|non-empty|required/i.test(error.message || '')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to update site settings' });
  }
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};
