const Service = require('../models/Service');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const normalizeServicePayload = (payload) => {
  const { title, slug, summary, description, features, seoTitle, seoDescription, isPublished } = payload;

  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }

  if (!summary || !summary.trim()) {
    throw new Error('Summary is required');
  }

  if (!description || !description.trim()) {
    throw new Error('Description is required');
  }

  const normalizedSlug = (slug || title)
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return {
    title: title.trim(),
    slug: normalizedSlug,
    summary: summary.trim(),
    description: description.trim(),
    features: Array.isArray(features) ? features.map((item) => String(item).trim()).filter(Boolean) : [],
    seoTitle: seoTitle ? seoTitle.trim() : undefined,
    seoDescription: seoDescription ? seoDescription.trim() : undefined,
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
  };
};

const getServices = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const total = await Service.countDocuments({ isPublished: true });
    const services = await Service.find({ isPublished: true })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: services, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch services' });
  }
};

const getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isPublished: true });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch service' });
  }
};

const createService = async (req, res) => {
  try {
    const payload = normalizeServicePayload(req.body);

    const existing = await Service.findOne({ slug: payload.slug });
    if (existing) {
      return res.status(409).json({ message: 'Service slug already exists' });
    }

    const service = await Service.create(payload);
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    if (error.message && /Title|Summary|Description|required|already exists/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to create service' });
  }
};

const updateService = async (req, res) => {
  try {
    const payload = normalizeServicePayload({ ...req.body, title: req.body.title || undefined });
    const existing = await Service.findOne({ slug: payload.slug, _id: { $ne: req.params.id } });

    if (existing) {
      return res.status(409).json({ message: 'Service slug already exists' });
    }

    const service = await Service.findByIdAndUpdate(req.params.id, payload, { new: true });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    if (error.message && /Title|Summary|Description|required|already exists/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to update service' });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete service' });
  }
};

// Admin-only list with filtering
const getServicesAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const { isPublished, q } = req.query;

    // Build filter
    const filter = {};

    if (typeof isPublished !== 'undefined') {
      filter.isPublished = isPublished === 'true';
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: services, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch services' });
  }
};

module.exports = {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServicesAdmin,
};
