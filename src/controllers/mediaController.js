const Media = require('../models/Media');
const { getCloudinary } = require('../config/cloudinary');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const uploadToCloudinary = (file, folder) => new Promise((resolve, reject) => {
  const cloudinary = getCloudinary();
  const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  const options = {
    folder: folder || 'boost-vertex',
    resource_type: resourceType,
    ...(resourceType === 'image' ? { transformation: [{ fetch_format: 'auto', quality: 'auto' }] } : {}),
  };

  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    resolve({ result, resourceType });
  });
  stream.end(file.buffer);
});

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'A file is required' });
    if (req.file.mimetype.startsWith('image/') && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image files must be 5MB or smaller' });
    }

    const folder = String(req.body.folder || 'boost-vertex').trim().replace(/[^a-zA-Z0-9/_-]/g, '') || 'boost-vertex';
    const altText = typeof req.body.altText === 'string' ? req.body.altText.trim() : '';
    const { result, resourceType } = await uploadToCloudinary(req.file, folder);
    const media = await Media.create({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      altText,
      folder,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
      uploadedBy: req.admin._id,
    });

    res.status(201).json({ message: 'Media uploaded successfully', media });
  } catch (error) {
    if (/not configured/i.test(error.message || '')) return res.status(503).json({ message: error.message });
    res.status(500).json({ message: error.message || 'Unable to upload media' });
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
        { altText: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const total = await Media.countDocuments(filter);
    const media = await Media.find(filter).populate('uploadedBy', 'name email').sort(sort).skip(skip).limit(limit);
    res.status(200).json({ data: media, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch media' });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(media.publicId, { resource_type: media.resourceType });
    await media.deleteOne();
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    if (/not configured/i.test(error.message || '')) return res.status(503).json({ message: error.message });
    res.status(500).json({ message: error.message || 'Unable to delete media' });
  }
};

module.exports = { uploadMedia, getMediaAdmin, deleteMedia };