const NewsletterSubscription = require('../models/NewsletterSubscription');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const subscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    const subscription = await NewsletterSubscription.findOneAndUpdate(
      { email },
      {
        email,
        status: 'active',
        source: req.body.source ? String(req.body.source).trim() : 'website',
        subscribedAt: new Date(),
        $unset: { unsubscribedAt: 1 },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Newsletter subscription active', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to subscribe to newsletter' });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || req.query.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    const subscription = await NewsletterSubscription.findOneAndUpdate(
      { email },
      { status: 'unsubscribed', unsubscribedAt: new Date() },
      { new: true }
    );

    res.status(200).json({
      message: 'Newsletter subscription removed',
      subscription: subscription || { email, status: 'unsubscribed' },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to unsubscribe from newsletter' });
  }
};

const getSubscriptionsAdmin = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.q) filter.email = { $regex: req.query.q, $options: 'i' };

    const total = await NewsletterSubscription.countDocuments(filter);
    const subscriptions = await NewsletterSubscription.find(filter).sort(sort).skip(skip).limit(limit);

    res.status(200).json({ data: subscriptions, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch newsletter subscriptions' });
  }
};

module.exports = { subscribe, unsubscribe, getSubscriptionsAdmin };