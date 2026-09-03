const Lead = require('../models/Lead');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const buildContactFilters = (query = {}) => {
  const filters = {};

  if (query.serviceInterest) filters.serviceInterest = query.serviceInterest;
  if (query.isRead !== undefined) filters.isRead = query.isRead === 'true';
  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }

  if (query.q) {
    filters.$or = [
      { name: { $regex: query.q, $options: 'i' } },
      { email: { $regex: query.q, $options: 'i' } },
      { subject: { $regex: query.q, $options: 'i' } },
      { message: { $regex: query.q, $options: 'i' } },
    ];
  }

  return filters;
};

const getContactMessages = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filters = buildContactFilters(req.query);
    const total = await Lead.countDocuments(filters);
    const contactMessages = await Lead.find(filters).sort(sort).skip(skip).limit(limit).lean();

    return sendSuccess(res, {
      message: 'Contact messages fetched successfully',
      data: contactMessages,
      extra: { pagination: buildPaginationMeta(page, limit, total) },
    });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to fetch contact messages' });
  }
};

const getContactMessageById = async (req, res) => {
  try {
    const contactMessage = await Lead.findById(req.params.id).lean();
    if (!contactMessage) return sendError(res, { status: 404, message: 'Contact message not found' });
    return sendSuccess(res, { message: 'Contact message fetched successfully', data: contactMessage });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to fetch contact message' });
  }
};

const updateContactMessageReadState = async (req, res) => {
  try {
    const { isRead } = req.body;
    const contactMessage = await Lead.findById(req.params.id);
    if (!contactMessage) return sendError(res, { status: 404, message: 'Contact message not found' });

    contactMessage.isRead = typeof isRead === 'boolean' ? isRead : !contactMessage.isRead;
    await contactMessage.save();
    return sendSuccess(res, { message: 'Contact message read state updated', data: contactMessage });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to update contact message read state' });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const contactMessage = await Lead.findByIdAndDelete(req.params.id);
    if (!contactMessage) return sendError(res, { status: 404, message: 'Contact message not found' });
    return sendSuccess(res, { message: 'Contact message deleted successfully', data: null });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to delete contact message' });
  }
};

module.exports = {
  getContactMessages,
  getContactMessageById,
  updateContactMessageReadState,
  deleteContactMessage,
  buildContactFilters,
};
