const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const validateComment = (payload) => {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const comment = String(payload.comment || '').trim();

  if (!name || !email || !comment) throw new Error('Name, email and comment are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email is required');

  return { name, email, comment };
};

const getPublicComments = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.blogId)) return res.status(404).json({ message: 'Blog not found' });
    const blog = await Blog.findOne({ _id: req.params.blogId, isPublished: true }).select('_id');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = { blog: blog._id, status: 'approved' };
    const total = await BlogComment.countDocuments(filter);
    const comments = await BlogComment.find(filter).select('-email').sort(sort).skip(skip).limit(limit);

    res.status(200).json({ data: comments, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch blog comments' });
  }
};

const createComment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.blogId)) return res.status(404).json({ message: 'Blog not found' });
    const blog = await Blog.findOne({ _id: req.params.blogId, isPublished: true }).select('_id');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const payload = validateComment(req.body);
    const comment = await BlogComment.create({ ...payload, blog: blog._id });

    res.status(201).json({ message: 'Comment submitted for moderation', comment: { _id: comment._id, status: comment.status } });
  } catch (error) {
    if (/required|valid email/i.test(error.message)) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message || 'Unable to submit blog comment' });
  }
};

const getCommentsAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.blogId && mongoose.isValidObjectId(req.query.blogId)) filter.blog = req.query.blogId;
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { email: { $regex: req.query.q, $options: 'i' } },
        { comment: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const total = await BlogComment.countDocuments(filter);
    const comments = await BlogComment.find(filter).populate('blog', 'title slug').sort(sort).skip(skip).limit(limit);
    res.status(200).json({ data: comments, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch comments' });
  }
};

const updateCommentStatus = async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'approved', 'rejected', 'spam'];
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Valid comment status is required' });

    const comment = await BlogComment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.status(200).json({ message: 'Comment status updated', comment });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update comment status' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await BlogComment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete comment' });
  }
};

module.exports = { getPublicComments, createComment, getCommentsAdmin, updateCommentStatus, deleteComment };