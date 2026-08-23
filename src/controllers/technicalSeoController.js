const Blog = require('../models/Blog');
const CaseStudy = require('../models/CaseStudy');
const Industry = require('../models/Industry');
const Service = require('../models/Service');

const getSiteUrl = () => (process.env.PUBLIC_SITE_URL || 'https://boostvertex.com').replace(/\/$/, '');

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const buildUrl = (loc, lastModified) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  lastModified ? `    <lastmod>${new Date(lastModified).toISOString()}</lastmod>` : '',
  '  </url>',
].filter(Boolean).join('\n');

const getSitemap = async (req, res) => {
  try {
    const [services, industries, caseStudies, blogs] = await Promise.all([
      Service.find({ isPublished: true }).select('slug updatedAt').lean(),
      Industry.find({ isPublished: true }).select('slug updatedAt').lean(),
      CaseStudy.find({ isPublished: true }).select('slug updatedAt').lean(),
      Blog.find({ isPublished: true }).select('slug updatedAt').lean(),
    ]);

    const siteUrl = getSiteUrl();
    const urls = [
      buildUrl(siteUrl),
      buildUrl(`${siteUrl}/about`),
      buildUrl(`${siteUrl}/contact`),
      ...services.map((item) => buildUrl(`${siteUrl}/services/${item.slug}`, item.updatedAt)),
      ...industries.map((item) => buildUrl(`${siteUrl}/industries/${item.slug}`, item.updatedAt)),
      ...caseStudies.map((item) => buildUrl(`${siteUrl}/case-studies/${item.slug}`, item.updatedAt)),
      ...blogs.map((item) => buildUrl(`${siteUrl}/blog/${item.slug}`, item.updatedAt)),
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urls.join('\n'),
      '</urlset>',
    ].join('\n');

    res.type('application/xml').status(200).send(xml);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate sitemap' });
  }
};

const getRobots = (req, res) => {
  const siteUrl = getSiteUrl();
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n');

  res.type('text/plain').status(200).send(robots);
};

module.exports = { getSitemap, getRobots };