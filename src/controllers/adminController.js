const Lead = require('../models/Lead');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const CaseStudy = require('../models/CaseStudy');
const Testimonial = require('../models/Testimonial');
const { getAnalyticsSummary } = require('../middleware/apiLogger');

const getDashboardSummary = async (req, res) => {
  try {
    // Basic counts
    const [
      leadCount,
      serviceCount,
      serviceUnpublishedCount,
      blogCount,
      blogUnpublishedCount,
      caseStudyCount,
      caseStudyUnpublishedCount,
      testimonialCount,
      testimonialUnpublishedCount,
    ] = await Promise.all([
      Lead.countDocuments(),
      Service.countDocuments({ isPublished: true }),
      Service.countDocuments({ isPublished: false }),
      Blog.countDocuments({ isPublished: true }),
      Blog.countDocuments({ isPublished: false }),
      CaseStudy.countDocuments({ isPublished: true }),
      CaseStudy.countDocuments({ isPublished: false }),
      Testimonial.countDocuments({ isPublished: true }),
      Testimonial.countDocuments({ isPublished: false }),
    ]);

    // Lead status breakdown
    const leadsByStatus = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Unread leads
    const unreadLeadsCount = await Lead.countDocuments({ isRead: false });

    // Recent leads
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Top sources (where leads come from)
    const leadSources = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Average testimonial rating
    const testimonialStats = await Testimonial.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = testimonialStats.length > 0 ? testimonialStats[0].averageRating : 0;

    res.status(200).json({
      summary: {
        // Content counts
        totalPublishedContent: serviceCount + blogCount + caseStudyCount,
        services: {
          published: serviceCount,
          unpublished: serviceUnpublishedCount,
          total: serviceCount + serviceUnpublishedCount,
        },
        blogs: {
          published: blogCount,
          unpublished: blogUnpublishedCount,
          total: blogCount + blogUnpublishedCount,
        },
        caseStudies: {
          published: caseStudyCount,
          unpublished: caseStudyUnpublishedCount,
          total: caseStudyCount + caseStudyUnpublishedCount,
        },
        testimonials: {
          published: testimonialCount,
          unpublished: testimonialUnpublishedCount,
          total: testimonialCount + testimonialUnpublishedCount,
          averageRating: Number(avgRating.toFixed(1)),
        },

        // Lead metrics
        leads: {
          total: leadCount,
          unread: unreadLeadsCount,
          byStatus: leadsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
        leadSources,
      },
      recentLeads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch dashboard summary' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = getAnalyticsSummary();
    res.status(200).json({
      message: 'Analytics data retrieved successfully',
      analytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch analytics' });
  }
};

module.exports = { getDashboardSummary, getAnalytics };
