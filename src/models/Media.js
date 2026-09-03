const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, unique: true, trim: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
    mimeType: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: '' },
    altText: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    folder: { type: String, trim: true, default: 'boost-vertex' },
    bytes: Number,
    width: Number,
    height: Number,
    format: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);