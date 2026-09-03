const Media = require('../models/Media');
const { getCloudinary } = require('../config/cloudinary');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean);
  return [];
};

const sanitizeFolder = (value) => String(value || 'boost-vertex').trim().replace(/[^a-zA-Z0-9/_-]/g, '') || 'boost-vertex';

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) return sendError(res, { status: 400, message: 'A file is required' });
    if (req.file.mimetype.startsWith('image/') && req.file.size > 5 * 1024 * 1024) {
      return sendError(res, { status: 400, message: 'Image files must be 5MB or smaller' });
    }

    const folder = sanitizeFolder(req.body.folder);
    const altText = typeof req.body.altText === 'string' ? req.body.altText.trim() : '';
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const tags = parseTags(req.body.tags);
    const { result, resourceType } = await uploadBufferToCloudinary(req.file, folder);
    const media = await Media.create({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      title,
      altText,
      tags,
      folder,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
      uploadedBy: req.admin._id,
    });

    return sendSuccess(res, { status: 201, message: 'Media uploaded successfully', data: media });
  } catch (error) {
    if (/not configured/i.test(error.message || '')) return sendError(res, { status: 503, message: error.message });
    return sendError(res, { message: error.message || 'Unable to upload media' });
  }
};

const getMediaAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = {};
    if (req.query.resourceType) filter.resourceType = req.query.resourceType;
    if (req.query.folder) filter.folder = req.query.folder;
    if (req.query.q) {
      filter.$or = [
        { originalName: { $regex: req.query.q, $options: 'i' } },
        { title: { $regex: req.query.q, $options: 'i' } },
        { altText: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const total = await Media.countDocuments(filter);
    const media = await Media.find(filter).populate('uploadedBy', 'name email').sort(sort).skip(skip).limit(limit);
    return sendSuccess(res, {
      message: 'Media fetched successfully',
      data: media,
      extra: { pagination: buildPaginationMeta(page, limit, total) },
    });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to fetch media' });
  }
};

const updateMedia = async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.altText === 'string') updates.altText = req.body.altText.trim();
    if (typeof req.body.title === 'string') updates.title = req.body.title.trim();
    if (req.body.tags !== undefined) updates.tags = parseTags(req.body.tags);
    if (typeof req.body.folder === 'string') updates.folder = sanitizeFolder(req.body.folder);

    if (Object.keys(updates).length === 0) {
      return sendError(res, { status: 400, message: 'No updatable fields provided' });
    }

    const media = await Media.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!media) return sendError(res, { status: 404, message: 'Media not found' });
    return sendSuccess(res, { message: 'Media updated successfully', data: media });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to update media' });
  }
};

const replaceMedia = async (req, res) => {
  try {
    if (!req.file) return sendError(res, { status: 400, message: 'A file is required' });
    if (req.file.mimetype.startsWith('image/') && req.file.size > 5 * 1024 * 1024) {
      return sendError(res, { status: 400, message: 'Image files must be 5MB or smaller' });
    }

    const media = await Media.findById(req.params.id);
    if (!media) return sendError(res, { status: 404, message: 'Media not found' });

    const cloudinary = getCloudinary();
    const previousPublicId = media.publicId;
    const previousResourceType = media.resourceType;
    const { result, resourceType } = await uploadBufferToCloudinary(req.file, media.folder);

    // Best-effort cleanup of the previous asset — don't fail the replace on it.
    try {
      await cloudinary.uploader.destroy(previousPublicId, { resource_type: previousResourceType });
    } catch (cleanupError) {
      console.warn('Failed to remove replaced media asset:', cleanupError.message);
    }

    media.url = result.secure_url;
    media.publicId = result.public_id;
    media.resourceType = resourceType;
    media.mimeType = req.file.mimetype;
    media.originalName = req.file.originalname;
    media.bytes = result.bytes;
    media.width = result.width;
    media.height = result.height;
    media.format = result.format;
    await media.save();

    return sendSuccess(res, { message: 'Media replaced successfully', data: media });
  } catch (error) {
    if (/not configured/i.test(error.message || '')) return sendError(res, { status: 503, message: error.message });
    return sendError(res, { message: error.message || 'Unable to replace media' });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return sendError(res, { status: 404, message: 'Media not found' });

    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(media.publicId, { resource_type: media.resourceType });
    await media.deleteOne();
    return sendSuccess(res, { message: 'Media deleted successfully', data: null });
  } catch (error) {
    if (/not configured/i.test(error.message || '')) return sendError(res, { status: 503, message: error.message });
    return sendError(res, { message: error.message || 'Unable to delete media' });
  }
};

module.exports = { uploadMedia, getMediaAdmin, updateMedia, replaceMedia, deleteMedia };
