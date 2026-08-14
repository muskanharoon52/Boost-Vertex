const Lead = require('../models/Lead');
const { sendEmail } = require('../config/mailer');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, serviceInterest, message, source, status, isRead } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      serviceInterest,
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
    const { status, isRead, source, q, dateFrom, dateTo } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (isRead !== undefined) {
      filters.isRead = isRead === 'true';
    }

    if (source) {
      filters.source = source;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) {
        filters.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.createdAt.$lte = new Date(dateTo);
      }
    }

    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
      ];
    }

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
  updateLeadStatus,
  updateLeadReadState,
};
