const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { apiLogger } = require('./middleware/apiLogger');
const { adminRateLimiter, adminWriteRateLimiter } = require('./middleware/adminRateLimiter');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// API request/response logging for analytics
app.use(apiLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Boost Vertex backend is running',
  });
});

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const blogRoutes = require('./routes/blogRoutes');
const caseStudyRoutes = require('./routes/caseStudyRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
