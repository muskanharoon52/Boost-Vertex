const CaseStudy = require('../models/CaseStudy');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const normalizeCaseStudyPayload = (payload) => {
  const {
    title,
    slug,
    clientName,
    industry,
    service,
    challenge,
    solution,
    whatWeDid,
    capabilities,
    relatedServices,
    client,
    cta,
    isFeatured,
    media,
    results,
    testimonial,
    seoTitle,
    seoDescription,
    isPublished,
  } = payload;

  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }

  if (!clientName || !clientName.trim()) {
    throw new Error('Client name is required');
  }

  if (!industry || !industry.trim()) {
    throw new Error('Industry is required');
  }

  if (!service || !service.trim()) {
    throw new Error('Service is required');
  }

  if (!challenge || !challenge.trim()) {
    throw new Error('Challenge is required');
  }

  if ((!solution || !solution.trim()) && (!whatWeDid || !whatWeDid.trim())) {
    throw new Error('Solution is required');
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
    clientName: clientName.trim(),
    industry: industry.trim(),
    service: service.trim(),
    challenge: challenge.trim(),
    solution: solution ? solution.trim() : whatWeDid.trim(),
    whatWeDid: whatWeDid ? whatWeDid.trim() : solution.trim(),
    capabilities: Array.isArray(capabilities) ? capabilities.map(String).map((item) => item.trim()).filter(Boolean) : [],
    relatedServices: Array.isArray(relatedServices) ? relatedServices.map(String).map((item) => item.trim()).filter(Boolean) : [],
    client: client || undefined,
    cta: cta ? cta.trim() : undefined,
    isFeatured: typeof isFeatured === 'boolean' ? isFeatured : false,
    media: Array.isArray(media) ? media.map(String).map((item) => item.trim()).filter(Boolean) : [],
    results: Array.isArray(results)
      ? results.map((item) => ({
          metric: item?.metric ? String(item.metric).trim() : '',
          description: item?.description ? String(item.description).trim() : '',
        }))
      : [],
    testimonial: testimonial ? testimonial.trim() : undefined,
    seoTitle: seoTitle ? seoTitle.trim() : undefined,
    seoDescription: seoDescription ? seoDescription.trim() : undefined,
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
  };
};

const getCaseStudies = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const total = await CaseStudy.countDocuments({ isPublished: true });
    const caseStudies = await CaseStudy.find({ isPublished: true })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: caseStudies, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch case studies' });
  }
};

const getCaseStudyBySlug = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOne({ slug: req.params.slug, isPublished: true });

    if (!caseStudy) {
      return res.status(404).json({ message: 'Case study not found' });
    }

    res.status(200).json(caseStudy);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch case study' });
  }
};

const createCaseStudy = async (req, res) => {
  try {
    const payload = normalizeCaseStudyPayload(req.body);

    const existing = await CaseStudy.findOne({ slug: payload.slug });
    if (existing) {
      return res.status(409).json({ message: 'Case study slug already exists' });
    }

    const caseStudy = await CaseStudy.create(payload);
    res.status(201).json({ message: 'Case study created successfully', caseStudy });
  } catch (error) {
    if (error.message && /Title|Client|Industry|Service|Challenge|Solution|required|already exists/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to create case study' });
  }
};

const updateCaseStudy = async (req, res) => {
  try {
    const payload = normalizeCaseStudyPayload(req.body);
    const existing = await CaseStudy.findOne({ slug: payload.slug, _id: { $ne: req.params.id } });

    if (existing) {
      return res.status(409).json({ message: 'Case study slug already exists' });
    }

    const caseStudy = await CaseStudy.findByIdAndUpdate(req.params.id, payload, { new: true });

    if (!caseStudy) {
      return res.status(404).json({ message: 'Case study not found' });
    }

    res.status(200).json({ message: 'Case study updated successfully', caseStudy });
  } catch (error) {
    if (error.message && /Title|Client|Industry|Service|Challenge|Solution|required|already exists/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to update case study' });
  }
};

const deleteCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findByIdAndDelete(req.params.id);

    if (!caseStudy) {
      return res.status(404).json({ message: 'Case study not found' });
    }

    res.status(200).json({ message: 'Case study deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete case study' });
  }
};

// Admin-only list with filtering
const getCaseStudiesAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const { isPublished, industry, service, q } = req.query;

    // Build filter
    const filter = {};

    if (typeof isPublished !== 'undefined') {
      filter.isPublished = isPublished === 'true';
    }

    if (industry) {
      filter.industry = industry;
    }

    if (service) {
      filter.service = service;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { clientName: { $regex: q, $options: 'i' } },
        { challenge: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await CaseStudy.countDocuments(filter);
    const caseStudies = await CaseStudy.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: caseStudies, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch case studies' });
  }
};

module.exports = {
  getCaseStudies,
  getCaseStudyBySlug,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  getCaseStudiesAdmin,
};
