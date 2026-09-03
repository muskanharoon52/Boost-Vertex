const Client = require('../models/Client');
const Industry = require('../models/Industry');
const SiteContent = require('../models/SiteContent');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const slugify = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
const listPublished = (Model) => async (req, res) => {
  try {
    const data = await Model.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 });
    return sendSuccess(res, { message: `${Model.modelName} fetched successfully`, data });
  } catch (error) { return sendError(res, { status: 500, message: error.message || 'Unable to fetch content' }); }
};
const listAdmin = (Model) => async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = {};

    if (req.query.isPublished !== undefined) {
      filter.isPublished = req.query.isPublished === 'true';
    }

    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { slug: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    if (req.query.sort) {
      // Preserve the explicit sort option when provided by the client.
    }

    const total = await Model.countDocuments(filter);
    const data = await Model.find(filter).sort(sort).skip(skip).limit(limit);
    return sendSuccess(res, {
      message: `${Model.modelName} fetched successfully`,
      data,
      extra: { pagination: buildPaginationMeta(page, limit, total) },
    });
  } catch (error) { return sendError(res, { status: 500, message: error.message || 'Unable to fetch content' }); }
};
const createRecord = (Model, label) => async (req, res) => {
  try {
    const payload = { ...req.body, slug: slugify(req.body.slug || req.body.name) };
    const record = await Model.create(payload);
    res.status(201).json({ message: `${label} created successfully`, [label.toLowerCase()]: record });
  } catch (error) { res.status(400).json({ message: error.message || `Unable to create ${label.toLowerCase()}` }); }
};
const updateRecord = (Model, label) => async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.name || payload.slug) payload.slug = slugify(payload.slug || payload.name);
    const record = await Model.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: `${label} not found` });
    res.status(200).json({ message: `${label} updated successfully`, [label.toLowerCase()]: record });
  } catch (error) { res.status(400).json({ message: error.message || `Unable to update ${label.toLowerCase()}` }); }
};
const deleteRecord = (Model, label) => async (req, res) => {
  try {
    const record = await Model.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: `${label} not found` });
    res.status(200).json({ message: `${label} deleted successfully` });
  } catch (error) { res.status(500).json({ message: error.message || `Unable to delete ${label.toLowerCase()}` }); }
};
const getBySlug = (Model, label) => async (req, res) => {
  try {
    const record = await Model.findOne({ slug: req.params.slug, isPublished: true });
    if (!record) return res.status(404).json({ message: `${label} not found` });
    res.status(200).json(record);
  } catch (error) { res.status(500).json({ message: error.message || `Unable to fetch ${label.toLowerCase()}` }); }
};
const getSiteContent = (type) => async (req, res) => {
  try {
    const content = await SiteContent.findOne({ type, isPublished: true });
    res.status(200).json(content || { type, content: {} });
  } catch (error) { res.status(500).json({ message: error.message || 'Unable to fetch site content' }); }
};
const updateSiteContent = (type) => async (req, res) => {
  try {
    const content = await SiteContent.findOneAndUpdate({ type }, { type, content: req.body, isPublished: true }, { new: true, upsert: true, runValidators: true });
    res.status(200).json({ message: `${type} content updated successfully`, content });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to update site content' }); }
};

module.exports = {
  getClients: listPublished(Client), getClientsAdmin: listAdmin(Client), getClientBySlug: getBySlug(Client, 'Client'),
  createClient: createRecord(Client, 'Client'), updateClient: updateRecord(Client, 'Client'), deleteClient: deleteRecord(Client, 'Client'),
  getIndustries: listPublished(Industry), getIndustriesAdmin: listAdmin(Industry), getIndustryBySlug: getBySlug(Industry, 'Industry'),
  createIndustry: createRecord(Industry, 'Industry'), updateIndustry: updateRecord(Industry, 'Industry'), deleteIndustry: deleteRecord(Industry, 'Industry'),
  getHomepageContent: getSiteContent('homepage'), updateHomepageContent: updateSiteContent('homepage'),
  getAboutContent: getSiteContent('about'), updateAboutContent: updateSiteContent('about'),
};