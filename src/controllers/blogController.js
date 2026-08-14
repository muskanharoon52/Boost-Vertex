const Blog = require('../models/Blog');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const normalizeBlogPayload = (payload) => {
  const { title, slug, excerpt, content, category, tags, author, seoTitle, seoDescription, isPublished } = payload;

  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }

  if (!excerpt || !excerpt.trim()) {
    throw new Error('Excerpt is required');
  }

  if (!content || !content.trim()) {
    throw new Error('Content is required');
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
    excerpt: excerpt.trim(),
    content: content.trim(),
    category: category ? category.trim() : 'General',
    tags: Array.isArray(tags) ? tags.map((item) => String(item).trim()).filter(Boolean) : [],
    author: author ? author.trim() : 'Boost Vertex',
    seoTitle: seoTitle ? seoTitle.trim() : undefined,
    seoDescription: seoDescription ? seoDescription.trim() : undefined,
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
  };
};

const getBlogs = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const total = await Blog.countDocuments({ isPublished: true });
    const blogs = await Blog.find({ isPublished: true })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: blogs, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch blogs' });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch blog' });
  }
};

const createBlog = async (req, res) => {
  try {
    const payload = normalizeBlogPayload(req.body);

    const existing = await Blog.findOne({ slug: payload.slug });
    if (existing) {
      return res.status(409).json({ message: 'Blog slug already exists' });
    }

    const blog = await Blog.create(payload);
    res.status(201).json({ message: 'Blog created successfully', blog });
  } catch (error) {
    if (error.message && /Title|Excerpt|Content|required|already exists/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to create blog' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const payload = normalizeBlogPayload(req.body);
    const existing = await Blog.findOne({ slug: payload.slug, _id: { $ne: req.params.id } });

    if (existing) {
      return res.status(409).json({ message: 'Blog slug already exists' });
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    if (error.message && /Title|Excerpt|Content|required|already exists/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to update blog' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete blog' });
  }
};

// Admin-only list with filtering
const getBlogsAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const { isPublished, category, q } = req.query;

    // Build filter
    const filter = {};

    if (typeof isPublished !== 'undefined') {
      filter.isPublished = isPublished === 'true';
    }

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: blogs, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch blogs' });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsAdmin,
};
