const Lead = require('../models/Lead');
const Admin = require('../models/Admin');
const { sendEmail } = require('../config/mailer');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { verifyRecaptcha, isRecaptchaEnforced } = require('../services/recaptchaService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const buildLeadFilters = (query = {}) => {
  const filters = {};

  if (query.status) filters.status = query.status;
  if (query.isRead !== undefined) filters.isRead = query.isRead === 'true';
  if (query.source) filters.source = query.source;
  if (query.serviceInterest) filters.serviceInterest = query.serviceInterest;

  if (query.dateFrom || query.dateTo) {
    filters.createdAt = {};
    if (query.dateFrom) filters.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.createdAt.$lte = new Date(query.dateTo);
  }

  if (query.q) {
    filters.$or = [
      { name: { $regex: query.q, $options: 'i' } },
      { email: { $regex: query.q, $options: 'i' } },
      { company: { $regex: query.q, $options: 'i' } },
      { subject: { $regex: query.q, $options: 'i' } },
      { message: { $regex: query.q, $options: 'i' } },
    ];
  }

  return filters;
};

// Transparent lead-quality heuristic, capped 0-100. Admins can override the
// stored score via PATCH /api/leads/:id.
const budgetScoreWeights = {
  'Under PKR 50,000': 5,
  'PKR 50,000–100,000': 10,
  'PKR 100,000–250,000': 20,
  'PKR 250,000–500,000': 30,
  'PKR 500,000+': 40,
};

const computeLeadScore = ({ monthlyBudget, phone, company, serviceInterest, message } = {}) => {
  let score = budgetScoreWeights[monthlyBudget] || 0;
  if (phone && String(phone).trim()) score += 20;
  if (company && String(company).trim()) score += 15;
  if (serviceInterest && String(serviceInterest).trim()) score += 10;
  if (message && String(message).trim().length >= 50) score += 15;
  return Math.max(0, Math.min(100, score));
};

const escapeCsv = (value) => {
  const text = value === null || typeof value === 'undefined' ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const leadCsvFields = [
  'createdAt',
  'name',
  'email',
  'phone',
  'company',
  'serviceInterest',
  'monthlyBudget',
  'subject',
  'message',
  'leadScore',
  'source',
  'status',
  'isRead',
];

// Whitelist of fields an admin may edit via the general lead update endpoint.
const updatableLeadFields = ['status', 'isRead', 'leadScore', 'subject', 'serviceInterest'];

const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceInterest,
      monthlyBudget,
      subject,
      message,
      source,
      status,
      isRead,
      recaptchaToken,
    } = req.body;

    if (!name || !email) {
      return sendError(res, { status: 400, message: 'Name and email are required' });
    }

    // The v2 Checkbox widget posts the token as `g-recaptcha-response`; also
    // accept an explicit `recaptchaToken` for clients that rename it.
    const recaptchaResponse = recaptchaToken || req.body['g-recaptcha-response'];

    const enforceRecaptcha = isRecaptchaEnforced();

    if (enforceRecaptcha && !recaptchaResponse) {
      return sendError(res, { status: 400, message: 'reCAPTCHA token is required' });
    }

    if (enforceRecaptcha) {
      const verification = await verifyRecaptcha(recaptchaResponse, req.ip);

      if (!verification.success) {
        if (verification.reason === 'service_unavailable') {
          return sendError(res, { status: 503, message: 'reCAPTCHA verification service unavailable' });
        }

        return sendError(res, {
          status: 403,
          message: 'reCAPTCHA verification failed',
          errors: verification.errors || [],
        });
      }
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      serviceInterest,
      monthlyBudget,
      subject,
      message,
      leadScore: computeLeadScore({ monthlyBudget, phone, company, serviceInterest, message }),
      source: source || 'website',
      status: status || 'new',
      isRead: typeof isRead === 'boolean' ? isRead : false,
    });

    try {
      // Respect the admin's notification preferences / target address when set.
      const admin = await Admin.findOne().select('notificationEmail notificationPrefs');
      const prefs = admin && admin.notificationPrefs ? admin.notificationPrefs : null;
      const notifyEnabled = !prefs || prefs.newLead !== false;

      if (notifyEnabled) {
        const targetEmail = (admin && admin.notificationEmail)
          || process.env.SMTP_USER
          || process.env.ADMIN_EMAIL
          || 'admin@boostvertex.com';

        await sendEmail({
          to: targetEmail,
          subject: 'New lead received from Boost Vertex website',
          html: `
            <h3>New Lead</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Service Interest:</strong> ${serviceInterest || 'N/A'}</p>
            <p><strong>Monthly Budget:</strong> ${monthlyBudget || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong> ${message || 'No message provided'}</p>
          `,
          text: `New lead: ${name} (${email})`,
        });
      }
    } catch (error) {
      console.warn('Lead notification skipped:', error.message);
    }

    return sendSuccess(res, {
      status: 201,
      message: 'Lead submitted successfully',
      data: lead,
      extra: {
        lead,
      },
    });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to submit lead' });
  }
};

const getLeads = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filters = buildLeadFilters(req.query);

    const total = await Lead.countDocuments(filters);
    const leads = await Lead.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const pagination = buildPaginationMeta(page, limit, total);

    return sendSuccess(res, { message: 'Leads fetched successfully', data: leads, extra: { pagination } });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to fetch leads' });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return sendError(res, { status: 404, message: 'Lead not found' });
    return sendSuccess(res, { message: 'Lead fetched successfully', data: lead });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to fetch lead' });
  }
};

const exportLeads = async (req, res) => {
  try {
    const filters = buildLeadFilters(req.query);
    const leads = await Lead.find(filters)
      .select(leadCsvFields.join(' '))
      .sort(req.query.sort || '-createdAt')
      .limit(10000)
      .lean();

    const header = leadCsvFields.join(',');
    const rows = leads.map((lead) => leadCsvFields.map((field) => escapeCsv(lead[field])).join(','));
    const csv = [header, ...rows].join('\r\n');
    const filename = `boost-vertex-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    res.status(200).send(csv);
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to export leads' });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, { status: 400, message: 'Status is required' });
    }

    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });

    if (!lead) {
      return sendError(res, { status: 404, message: 'Lead not found' });
    }

    return sendSuccess(res, { message: 'Lead status updated', data: lead });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to update lead status' });
  }
};

const updateLeadReadState = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return sendError(res, { status: 404, message: 'Lead not found' });
    }

    const nextReadState = typeof isRead === 'boolean' ? isRead : !lead.isRead;
    lead.isRead = nextReadState;
    await lead.save();

    return sendSuccess(res, {
      message: 'Lead read state updated',
      data: lead,
      extra: { lead },
    });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to update lead read state' });
  }
};

const updateLead = async (req, res) => {
  try {
    const updates = {};
    updatableLeadFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, { status: 400, message: 'No updatable fields provided' });
    }

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!lead) return sendError(res, { status: 404, message: 'Lead not found' });

    return sendSuccess(res, {
      message: 'Lead updated successfully',
      data: lead,
      extra: { lead },
    });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to update lead' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return sendError(res, { status: 404, message: 'Lead not found' });
    return sendSuccess(res, {
      message: 'Lead deleted successfully',
      data: null,
      extra: { lead },
    });
  } catch (error) {
    return sendError(res, { message: error.message || 'Unable to delete lead' });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  exportLeads,
  updateLeadStatus,
  updateLeadReadState,
  updateLead,
  deleteLead,
};
