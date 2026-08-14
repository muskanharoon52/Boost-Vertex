const SiteSettings = require('../models/SiteSettings');

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
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(req.body);
      return res.status(201).json({ message: 'Site settings created', settings });
    }

    settings = await SiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true });

    res.status(200).json({ message: 'Site settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update site settings' });
  }
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};
