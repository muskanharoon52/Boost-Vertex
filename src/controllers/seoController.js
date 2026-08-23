const Blog = require('../models/Blog');
const CaseStudy = require('../models/CaseStudy');
const Industry = require('../models/Industry');
const Service = require('../models/Service');
const SiteSettings = require('../models/SiteSettings');
const Testimonial = require('../models/Testimonial');

const siteUrl = () => (process.env.PUBLIC_SITE_URL || 'https://boostvertex.com').replace(/\/$/, '');

const getSettings = async () => SiteSettings.findOne().lean();

const organizationSchema = (settings) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: settings?.companyName || 'Boost Vertex',
  url: siteUrl(),
  email: settings?.email,
  telephone: settings?.phone,
  sameAs: [
    settings?.socialLinks?.facebook,
    settings?.socialLinks?.instagram,
    settings?.socialLinks?.linkedin,
  ].filter(Boolean),
  address: settings?.address
    ? {
        '@type': 'PostalAddress',
        streetAddress: settings.address,
        addressCountry: 'PK',
      }
    : undefined,
});

const cleanSchema = (schema) => Object.fromEntries(
  Object.entries(schema).filter(([, value]) => value !== undefined && value !== null && value !== ''),
);

const getOrganizationSchema = async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json(organizationSchema(settings));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate organization schema' });
  }
};

const getServiceSchema = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const settings = await getSettings();
    const graph = [cleanSchema({
      '@type': 'Service',
      '@id': `${siteUrl()}/services/${service.slug}#service`,
      name: service.title,
      description: service.description,
      url: `${siteUrl()}/services/${service.slug}`,
      provider: { '@id': `${siteUrl()}/#organization` },
      areaServed: ['Pakistan', 'United Arab Emirates', 'Saudi Arabia'],
    })];

    const faqs = Array.isArray(service.faqs)
      ? service.faqs.filter((faq) => faq.question && faq.answer)
      : [];

    if (faqs.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${siteUrl()}/services/${service.slug}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }

    res.status(200).json({
      '@context': 'https://schema.org',
      '@graph': [organizationSchema(settings), ...graph],
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate service schema' });
  }
};

const getIndustrySchema = async (req, res) => {
  try {
    const industry = await Industry.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!industry) return res.status(404).json({ message: 'Industry not found' });

    res.status(200).json(cleanSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: industry.name,
      description: industry.description,
      url: `${siteUrl()}/industries/${industry.slug}`,
      about: { '@type': 'Thing', name: industry.name },
    }));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate industry schema' });
  }
};

const getCaseStudySchema = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!caseStudy) return res.status(404).json({ message: 'Case study not found' });

    res.status(200).json(cleanSchema({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: caseStudy.title,
      description: caseStudy.challenge,
      url: `${siteUrl()}/case-studies/${caseStudy.slug}`,
      about: { '@type': 'Thing', name: caseStudy.industry },
      author: { '@type': 'Organization', name: 'Boost Vertex', url: siteUrl() },
      isPartOf: { '@type': 'WebSite', name: 'Boost Vertex', url: siteUrl() },
    }));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate case study schema' });
  }
};

const getBlogSchema = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    res.status(200).json(cleanSchema({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blog.title,
      description: blog.excerpt,
      articleBody: blog.content,
      url: `${siteUrl()}/blog/${blog.slug}`,
      author: { '@type': 'Organization', name: blog.author || 'Boost Vertex', url: siteUrl() },
      keywords: Array.isArray(blog.tags) ? blog.tags.join(', ') : undefined,
    }));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate blog schema' });
  }
};

const getReviewSchema = async (req, res) => {
  try {
    const reviews = await Testimonial.find({
      isPublished: true,
      isDraft: false,
      isApproved: true,
      permissionGranted: true,
    }).lean();

    res.status(200).json({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: reviews.map((review, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: cleanSchema({
          '@type': 'Review',
          author: { '@type': 'Person', name: review.name },
          reviewBody: review.quote,
          reviewRating: review.rating
            ? { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 }
            : undefined,
          itemReviewed: { '@type': 'Organization', name: review.company || 'Boost Vertex' },
        }),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to generate review schema' });
  }
};

module.exports = {
  getOrganizationSchema,
  getServiceSchema,
  getIndustrySchema,
  getCaseStudySchema,
  getBlogSchema,
  getReviewSchema,
};