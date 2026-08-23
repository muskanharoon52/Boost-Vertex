const Testimonial = require('../models/Testimonial');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const normalizeTestimonialPayload = (payload) => {
  const { name, role, company, quote, rating, platform, isDraft, isApproved, permissionGranted, reviewUrl, clientPhoto, clientLogo, isPublished } = payload;

  if (!name || !name.trim()) {
    throw new Error('Name is required');
  }

  if (!role || !role.trim()) {
    throw new Error('Role is required');
  }

  if (!quote || !quote.trim()) {
    throw new Error('Quote is required');
  }

  const numericRating = Number(rating);

  return {
    name: name.trim(),
    role: role.trim(),
    company: company ? company.trim() : '',
    quote: quote.trim(),
    rating: Number.isFinite(numericRating) ? Math.min(5, Math.max(1, numericRating)) : 5,
    platform: platform ? platform.trim() : 'Google',
    isDraft: typeof isDraft === 'boolean' ? isDraft : true,
    isApproved: typeof isApproved === 'boolean' ? isApproved : false,
    permissionGranted: typeof permissionGranted === 'boolean' ? permissionGranted : false,
    reviewUrl: reviewUrl ? reviewUrl.trim() : undefined,
    clientPhoto: clientPhoto ? clientPhoto.trim() : undefined,
    clientLogo: clientLogo ? clientLogo.trim() : undefined,
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
  };
};

const getTestimonials = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const publicFilter = {
      isPublished: true,
      isDraft: false,
      isApproved: true,
      permissionGranted: true,
    };
    const total = await Testimonial.countDocuments(publicFilter);
    const testimonials = await Testimonial.find(publicFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: testimonials, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch testimonials' });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const payload = normalizeTestimonialPayload(req.body);
    const testimonial = await Testimonial.create(payload);
    res.status(201).json({ message: 'Testimonial created successfully', testimonial });
  } catch (error) {
    if (error.message && /Name|Role|Quote|required/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to create testimonial' });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const payload = normalizeTestimonialPayload(req.body);
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, payload, { new: true });

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.status(200).json({ message: 'Testimonial updated successfully', testimonial });
  } catch (error) {
    if (error.message && /Name|Role|Quote|required/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Unable to update testimonial' });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete testimonial' });
  }
};

// Admin-only list with filtering
const getTestimonialsAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const { isPublished, rating, platform, q } = req.query;

    // Build filter
    const filter = {};

    if (typeof isPublished !== 'undefined') {
      filter.isPublished = isPublished === 'true';
    }

    if (rating) {
      const ratingNum = Number(rating);
      if (!Number.isNaN(ratingNum)) {
        filter.rating = ratingNum;
      }
    }

    if (platform) {
      filter.platform = platform;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { quote: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await Testimonial.countDocuments(filter);
    const testimonials = await Testimonial.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    res.status(200).json({ data: testimonials, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch testimonials' });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialsAdmin,
};
