const Lead = require('../models/Lead');
const { sendEmail } = require('../config/mailer');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { verifyRecaptcha } = require('../services/recaptchaService');

const buildLeadFilters = (query = {}) => {
  const filters = {};

  if (query.status) filters.status = query.status;
  if (query.isRead !== undefined) filters.isRead = query.isRead === 'true';
  if (query.source) filters.source = query.source;

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
    ];
  }

  return filters;
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
  'message',
  'source',
  'status',
  'isRead',
];

const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceInterest,
      monthlyBudget,
      message,
      source,
      status,
      isRead,
      recaptchaToken,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const hasRecaptchaSecret = Boolean(process.env.RECAPTCHA_SECRET_KEY);
    const enforceRecaptcha = process.env.NODE_ENV === 'production' && hasRecaptchaSecret;

    if (enforceRecaptcha && !recaptchaToken) {
      return res.status(400).json({ message: 'reCAPTCHA token is required' });
    }

    if (recaptchaToken || enforceRecaptcha) {
      const verification = await verifyRecaptcha(recaptchaToken, req.ip);

      if (!verification.success) {
        if (verification.reason === 'service_unavailable') {
          return res.status(503).json({ message: 'reCAPTCHA verification service unavailable' });
        }

        return res.status(403).json({
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
      message,
      source: source || 'website',
      status: status || 'new',
      isRead: typeof isRead === 'boolean' ? isRead : false,
    });

    const targetEmail = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@boostvertex.com';

    try {
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
          <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        `,
        text: `New lead: ${name} (${email})`,
      });
    } catch (error) {
      console.warn('Lead notification skipped because SMTP is unavailable:', error.message);
    }

    res.status(201).json({
      message: 'Lead submitted successfully',
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to submit lead' });
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

    res.status(200).json({ data: leads, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch leads' });
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
    res.status(500).json({ message: error.message || 'Unable to export leads' });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead status updated', lead });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update lead status' });
  }
};

const updateLeadReadState = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const nextReadState = typeof isRead === 'boolean' ? isRead : !lead.isRead;
    lead.isRead = nextReadState;
    await lead.save();

    res.status(200).json({ message: 'Lead read state updated', lead });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update lead read state' });
  }
};

module.exports = {
  createLead,
  getLeads,
  exportLeads,
  updateLeadStatus,
  updateLeadReadState,
};
