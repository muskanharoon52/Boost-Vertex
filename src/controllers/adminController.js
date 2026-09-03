const Lead = require('../models/Lead');
const Admin = require('../models/Admin');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const CaseStudy = require('../models/CaseStudy');
const Testimonial = require('../models/Testimonial');
const Client = require('../models/Client');
const Industry = require('../models/Industry');
const BlogComment = require('../models/BlogComment');
const { getAnalyticsSummary } = require('../middleware/apiLogger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getPeriodStart = (period) => {
  const now = new Date();
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (period === 'quarter') return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  if (period === 'ytd') return new Date(now.getFullYear(), 0, 1);
  return null;
};

const getDashboardSummary = async (req, res) => {
  try {
    const period = req.query.period || 'all';
    const periodStart = getPeriodStart(period);
    const leadFilter = periodStart ? { createdAt: { $gte: periodStart } } : {};
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
      clientCount,
      industryCount,
    ] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Service.countDocuments({ isPublished: true }),
      Service.countDocuments({ isPublished: false }),
      Blog.countDocuments({ isPublished: true }),
      Blog.countDocuments({ isPublished: false }),
      CaseStudy.countDocuments({ isPublished: true }),
      CaseStudy.countDocuments({ isPublished: false }),
      Testimonial.countDocuments({ isPublished: true }),
      Testimonial.countDocuments({ isPublished: false }),
      Client.countDocuments({ isPublished: true }),
      Industry.countDocuments({ isPublished: true }),
    ]);

    // Lead status breakdown
    const leadsByStatus = await Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Unread leads
    const unreadLeadsCount = await Lead.countDocuments({ ...leadFilter, isRead: false });

    // Recent leads
    const recentLeads = await Lead.find(leadFilter)
      .sort({ createdAt: -1 })
      .limit(5);

    const recentContactMessages = recentLeads;

    const [recentServices, recentIndustries, recentCaseStudies, recentBlogs] = await Promise.all([
      Service.find().select('title slug isPublished createdAt updatedAt').sort({ updatedAt: -1 }).limit(3).lean(),
      Industry.find().select('name slug isPublished createdAt updatedAt').sort({ updatedAt: -1 }).limit(3).lean(),
      CaseStudy.find().select('title slug isPublished createdAt updatedAt').sort({ updatedAt: -1 }).limit(3).lean(),
      Blog.find().select('title slug isPublished createdAt updatedAt').sort({ updatedAt: -1 }).limit(3).lean(),
    ]);

    const recentContent = [
      ...recentServices.map((item) => ({ ...item, type: 'service', title: item.title })),
      ...recentIndustries.map((item) => ({ ...item, type: 'industry', title: item.name })),
      ...recentCaseStudies.map((item) => ({ ...item, type: 'caseStudy', title: item.title })),
      ...recentBlogs.map((item) => ({ ...item, type: 'blog', title: item.title })),
    ].sort((first, second) => new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt)).slice(0, 8);

    const topServices = await Lead.aggregate([
      { $match: { ...leadFilter, serviceInterest: { $exists: true, $nin: ['', null] } } },
      { $group: { _id: '$serviceInterest', leads: { $sum: 1 } } },
      { $sort: { leads: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, service: '$_id', leads: 1 } },
    ]);

    const [pendingComments, draftTestimonials] = await Promise.all([
      BlogComment.countDocuments({ status: 'pending' }),
      Testimonial.countDocuments({ isPublished: true, isDraft: true }),
    ]);

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

    const summary = {
      period,
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
      industries: {
        published: industryCount,
        total: industryCount,
      },
      clients: {
        published: clientCount,
        total: clientCount,
      },
      testimonials: {
        published: testimonialCount,
        unpublished: testimonialUnpublishedCount,
        total: testimonialCount + testimonialUnpublishedCount,
        averageRating: Number(avgRating.toFixed(1)),
      },
      leads: {
        total: leadCount,
        unread: unreadLeadsCount,
        byStatus: leadsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      leadSources,
      topServices,
      notifications: {
        unreadLeads: unreadLeadsCount,
        pendingComments,
        draftTestimonials,
        total: unreadLeadsCount + pendingComments + draftTestimonials,
      },
    };

    return sendSuccess(res, {
      message: 'Dashboard summary fetched successfully',
      data: {
        summary,
        recentLeads,
        recentContactMessages,
        recentContent,
        topServices,
      },
      extra: {
        summary,
        recentLeads,
        recentContactMessages,
        recentContent,
        topServices,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch dashboard summary' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = getAnalyticsSummary();
    return sendSuccess(res, {
      message: 'Analytics data retrieved successfully',
      data: analytics,
      extra: { analytics },
    });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to fetch analytics' });
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).lean();
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    return sendSuccess(res, {
      message: 'Notification settings fetched successfully',
      data: {
        notificationEmail: admin.notificationEmail || '',
        notificationPrefs: {
          newContactMessage: admin.notificationPrefs?.newContactMessage ?? true,
          newLead: admin.notificationPrefs?.newLead ?? true,
          leadUpdated: admin.notificationPrefs?.leadUpdated ?? true,
          leadDeleted: admin.notificationPrefs?.leadDeleted ?? true,
          serviceUpdated: admin.notificationPrefs?.serviceUpdated ?? true,
        },
      },
    });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to fetch notification settings' });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    const notificationEmail = req.body.notificationEmail;
    if (notificationEmail !== undefined && notificationEmail !== null && notificationEmail !== '') {
      const normalizedEmail = String(notificationEmail).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return sendError(res, { status: 400, message: 'Notification email is invalid' });
      }
      admin.notificationEmail = normalizedEmail;
    } else if (notificationEmail === '') {
      admin.notificationEmail = '';
    }

    if (req.body.notificationPrefs && typeof req.body.notificationPrefs === 'object') {
      admin.notificationPrefs = {
        ...admin.notificationPrefs.toObject ? admin.notificationPrefs.toObject() : admin.notificationPrefs,
        newContactMessage: req.body.notificationPrefs.newContactMessage ?? admin.notificationPrefs?.newContactMessage ?? true,
        newLead: req.body.notificationPrefs.newLead ?? admin.notificationPrefs?.newLead ?? true,
        leadUpdated: req.body.notificationPrefs.leadUpdated ?? admin.notificationPrefs?.leadUpdated ?? true,
        leadDeleted: req.body.notificationPrefs.leadDeleted ?? admin.notificationPrefs?.leadDeleted ?? true,
        serviceUpdated: req.body.notificationPrefs.serviceUpdated ?? admin.notificationPrefs?.serviceUpdated ?? true,
      };
    }

    await admin.save();

    return sendSuccess(res, {
      message: 'Notification settings updated successfully',
      data: {
        notificationEmail: admin.notificationEmail || '',
        notificationPrefs: {
          newContactMessage: admin.notificationPrefs?.newContactMessage ?? true,
          newLead: admin.notificationPrefs?.newLead ?? true,
          leadUpdated: admin.notificationPrefs?.leadUpdated ?? true,
          leadDeleted: admin.notificationPrefs?.leadDeleted ?? true,
          serviceUpdated: admin.notificationPrefs?.serviceUpdated ?? true,
        },
      },
    });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to update notification settings' });
  }
};

module.exports = { getDashboardSummary, getAnalytics, getNotificationSettings, updateNotificationSettings };
