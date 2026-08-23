const LegalDocument = require('../models/LegalDocument');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const allowedTypes = ['privacy-policy', 'terms', 'cookie-policy', 'disclaimer'];

const validateType = (type) => allowedTypes.includes(type);

const normalizePayload = (payload = {}, type, adminId) => {
  const title = String(payload.title || '').trim();
  const content = String(payload.content || '').trim();
  const version = String(payload.version || '').trim();

  if (!validateType(type)) throw new Error('Invalid legal document type');
  if (!title) throw new Error('Title is required');
  if (!content) throw new Error('Approved legal content is required');
  if (!version) throw new Error('Version is required');

  const normalized = {
    type,
    title,
    content,
    version,
    isPublished: typeof payload.isPublished === 'boolean' ? payload.isPublished : false,
    updatedBy: adminId,
  };

  if (payload.effectiveDate) {
    const effectiveDate = new Date(payload.effectiveDate);
    if (Number.isNaN(effectiveDate.getTime())) throw new Error('Effective date must be valid');
    normalized.effectiveDate = effectiveDate;
  } else if (payload.effectiveDate === null) {
    normalized.effectiveDate = null;
  }

  return normalized;
};

const getLegalDocument = async (req, res) => {
  try {
    if (!validateType(req.params.type)) return res.status(404).json({ message: 'Legal document not found' });

    const document = await LegalDocument.findOne({ type: req.params.type, isPublished: true }).select('-updatedBy');
    if (!document) return res.status(404).json({ message: 'Legal document not found' });

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch legal document' });
  }
};

const getLegalDocumentsAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (typeof req.query.isPublished !== 'undefined') filter.isPublished = req.query.isPublished === 'true';
    if (req.query.q) {
      filter.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { type: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const total = await LegalDocument.countDocuments(filter);
    const documents = await LegalDocument.find(filter).sort(sort).skip(skip).limit(limit);

    res.status(200).json({ data: documents, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch legal documents' });
  }
};

const upsertLegalDocument = async (req, res) => {
  try {
    const payload = normalizePayload(req.body, req.params.type, req.admin._id);
    const existing = await LegalDocument.findOne({ type: payload.type });
    const document = existing
      ? await LegalDocument.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true })
      : await LegalDocument.create(payload);

    res.status(existing ? 200 : 201).json({
      message: existing ? 'Legal document updated successfully' : 'Legal document created successfully',
      document,
    });
  } catch (error) {
    if (/required|valid|Invalid/i.test(error.message || '')) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message || 'Unable to save legal document' });
  }
};

module.exports = { getLegalDocument, getLegalDocumentsAdmin, upsertLegalDocument };