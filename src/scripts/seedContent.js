const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('../models/Service');
const Client = require('../models/Client');
const Industry = require('../models/Industry');
const Testimonial = require('../models/Testimonial');
const CaseStudy = require('../models/CaseStudy');
const SiteSettings = require('../models/SiteSettings');
const SiteContent = require('../models/SiteContent');

dotenv.config();

const services = [
    {
      title: 'Meta Ads Management',
      slug: 'meta-ads-management',
      summary: 'Facebook and Instagram advertising built for customer acquisition.',
      description: "Boost Vertex's primary service: Meta Ads focused on lead generation, conversions, audience targeting, retargeting, creative testing, and conversion tracking.",
      features: ['Meta Ads', 'Facebook Ads', 'Instagram Ads', 'Lead generation', 'Conversion tracking', 'Creative testing'],
      approach: ['Audience targeting', 'Campaign planning', 'Creative testing', 'Conversion tracking', 'Campaign optimization'],
      deliverables: ['Campaign strategy', 'Ad creatives', 'Audience targeting setup', 'Conversion tracking implementation', 'Performance reporting'],
      cta: 'Get a Free Consultation',
      primaryKeyword: 'Meta Ads agency Pakistan',
      secondaryKeywords: ['Facebook Ads agency Pakistan', 'Instagram Ads agency Pakistan', 'Meta Ads agency UAE', 'Meta Ads agency Saudi Arabia'],
      isFeatured: true,
    },
    {
      title: 'Lead Generation',
      slug: 'lead-generation',
      summary: 'Qualified lead-generation campaigns focused on relevance and conversion potential, not just volume.',
      description: 'Boost Vertex builds lead-generation systems focused on relevant, commercially valuable prospects through Meta Ads, landing pages, and lead qualification.',
      features: ['Qualified lead generation', 'Landing pages', 'Lead forms', 'Lead qualification', 'WhatsApp lead journeys'],
      approach: ['Define ideal customer profile', 'Build targeting and campaign structure', 'Set up landing pages or WhatsApp capture', 'Test and refine lead quality'],
      deliverables: ['Lead-generation campaign setup', 'Landing-page or lead-form structure', 'Lead-quality tracking framework', 'Performance reporting'],
      cta: 'Get a Free Consultation',
      primaryKeyword: 'Lead generation agency Pakistan',
      secondaryKeywords: ['Lead generation agency UAE', 'Lead generation agency Saudi Arabia', 'Lead generation services'],
      isFeatured: true,
    },
    {
      title: 'Google Ads',
      slug: 'google-ads',
      summary: 'Search advertising targeting high-intent customers actively searching for your product or service.',
      description: 'Google Ads campaigns built around high-intent keyword targeting, structured campaigns, conversion-tracked ad copy, and landing-page alignment.',
      features: ['Keyword research', 'Search campaigns', 'Ad copy', 'Conversion tracking', 'Remarketing'],
      approach: ['Keyword research', 'Campaign structure', 'Ad copywriting', 'Conversion tracking', 'Landing-page alignment', 'Remarketing'],
      deliverables: ['Campaign setup', 'Keyword strategy', 'Ad copy', 'Conversion tracking', 'Performance reporting'],
      cta: 'Get a Free Consultation',
      primaryKeyword: 'Google Ads agency Pakistan',
      secondaryKeywords: ['Google Ads agency UAE', 'Google Ads agency Saudi Arabia'],
    },
    {
      title: 'YouTube Ads',
      slug: 'youtube-ads',
      summary: 'Video advertising campaigns built for awareness, consideration, and conversion.',
      description: 'YouTube Ads campaigns covering audience targeting, funnel-stage strategy, creative strategy, and conversion-focused optimization.',
      features: ['Video advertising', 'Audience targeting', 'Awareness campaigns', 'Remarketing', 'Conversion campaigns'],
      approach: ['Audience targeting', 'Funnel-stage planning', 'Creative strategy', 'Campaign launch', 'Optimization'],
      deliverables: ['Campaign setup', 'Targeting strategy', 'Performance reporting'],
      cta: 'Get a Free Consultation',
      primaryKeyword: 'YouTube Ads agency Pakistan',
      secondaryKeywords: ['YouTube Ads agency UAE', 'YouTube Ads agency Saudi Arabia', 'YouTube Ads agency'],
    },
    {
      title: 'SEO',
      slug: 'seo',
      summary: 'Search engine optimization focused on organic visibility that supports conversion, not just rankings.',
      description: 'SEO services covering keyword research, technical SEO, on-page optimization, content strategy, internal linking, and local SEO.',
      features: ['Keyword research', 'Technical SEO', 'On-page optimization', 'Content strategy', 'Internal linking', 'Local SEO'],
      approach: ['Keyword research', 'Technical audit', 'On-page optimization', 'Content strategy', 'Internal linking', 'Local SEO'],
      deliverables: ['SEO audit', 'Keyword strategy', 'On-page recommendations', 'Content plan'],
      cta: 'Get a Free Consultation',
      primaryKeyword: 'SEO agency Pakistan',
      secondaryKeywords: ['SEO agency UAE', 'SEO agency Saudi Arabia', 'Digital marketing services'],
    },
    {
      title: 'Web Development',
      slug: 'web-development',
      summary: 'Conversion-focused websites and landing pages built to support marketing campaigns.',
      description: 'Web development support for lead-generation websites, landing pages, marketing funnels, SEO-ready foundations, and marketing integrations.',
      features: ['Websites', 'Landing pages', 'Marketing funnels', 'SEO-ready structure', 'Marketing integrations'],
      approach: ['Requirements gathering', 'Design', 'Development', 'SEO-ready setup', 'Marketing tool integration'],
      deliverables: ['Website or landing page', 'Integrations', 'SEO-ready structure'],
      cta: 'Get a Free Consultation',
      primaryKeyword: 'Digital marketing services Pakistan',
      secondaryKeywords: ['Web development for marketing', 'Conversion-focused websites'],
    },
  ].map((service, sortOrder) => ({
    ...service,
    isFeatured: service.isFeatured || false,
    sortOrder,
    isPublished: true,
    expectedOutcomes: [],
    benefits: [],
    faqs: [],
    searchIntent: 'Commercial',
    internalLinkingRecommendations: [],
    relatedCaseStudies: [],
  }));

const clients = [
  ['MovePro Pakistan', 'movepro-pakistan'],
  ['Dr. Waqas Ahmad / Homoeopathic Centre Medicare', 'dr-waqas-ahmad'],
  ['Whizpool', 'whizpool'],
  ['AH Interior', 'ah-interior'],
  ['Mr. Ali - Software Company', 'mr-ali-software-company'],
].map(([name, slug], sortOrder) => ({ name, slug, sortOrder, isPublished: true, displayPermission: true }));

const industries = [
  { name: 'Transport & Logistics', slug: 'transport-logistics', description: 'Confirmed client experience helping transport and logistics businesses generate relevant leads.', relatedServices: ['Meta Ads Management', 'Lead Generation'], relatedClients: ['MovePro Pakistan'], relatedCaseStudies: ['movepro-pakistan'] },
  { name: 'Healthcare', slug: 'healthcare', description: 'Confirmed experience generating relevant patient and client leads for healthcare practices.', relatedServices: ['Lead Generation'], relatedClients: ['Dr. Waqas Ahmad / Homoeopathic Centre Medicare'], relatedCaseStudies: ['dr-waqas-ahmad'] },
  { name: 'Technology / Software', slug: 'technology-software', description: 'Confirmed experience supporting software companies with social media, LinkedIn content, and Meta Ads.', relatedServices: ['Meta Ads Management'], relatedClients: ['Whizpool', 'Mr. Ali - Software Company'], relatedCaseStudies: ['whizpool'] },
].map((industry, sortOrder) => ({ ...industry, sortOrder, isPublished: true }));

const testimonials = [
  ['Hasnain Ahmed', 'Founder & CEO', 'MovePro Pakistan', 'Boost Vertex helped us generate high-quality and mature leads through Meta Ads. The leads were relevant to our business, and we were happy with the overall quality.'],
  ['Dr. Waqas Ahmad', 'Lead Generation Client', 'Homoeopathic Centre Medicare', 'Boost Vertex helped us generate relevant leads for our business. They understood our requirements and delivered a good response through their lead-generation campaigns.'],
  ['Muhammad Bilal', 'Client', 'Whizpool', 'Boost Vertex supported us with social media management and Meta Ads. Their work helped improve our online presence and created better opportunities through our digital channels.'],
  ['AH Interior', 'Client', 'AH Interior', 'Boost Vertex helped us generate proper leads through Meta Ads for our business. We received relevant inquiries from potential customers and were satisfied with the response.'],
  ['Mr. Ali', 'Founder', 'Software Company', 'Boost Vertex helped us generate mature and relevant leads through LinkedIn and Meta Ads. The campaigns were focused on reaching the right prospects for our business.'],
].map(([name, role, company, quote], index) => ({ name, role, company, quote, isDraft: true, isApproved: false, permissionGranted: index < 2, isPublished: true }));

const caseStudies = [
  { title: 'MovePro Pakistan', slug: 'movepro-pakistan', clientName: 'MovePro Pakistan', industry: 'Transport & Logistics', service: 'Meta Ads + Lead Generation', challenge: 'MovePro Pakistan needed a reliable way to generate relevant prospects through paid advertising.', solution: 'Built and optimized a Meta Ads lead-generation strategy focused on relevant, business-ready prospects.', whatWeDid: 'Built and optimized a Meta Ads lead-generation strategy focused on relevant, business-ready prospects.', results: [{ metric: 'Known outcome', description: 'High-quality and mature leads were generated, and the client was satisfied with the prospect quality.' }], isPublished: true },
  { title: 'Dr. Waqas Ahmad', slug: 'dr-waqas-ahmad', clientName: 'Dr. Waqas Ahmad', industry: 'Healthcare', service: 'Lead Generation', challenge: 'The practice needed a consistent way to generate patient and client leads.', solution: 'Implemented a lead-generation strategy tailored to the practice audience.', whatWeDid: 'Implemented a lead-generation strategy tailored to the practice audience.', results: [{ metric: 'Known outcome', description: "Boost Vertex generated relevant leads for the client's business." }], isPublished: true },
  { title: 'Whizpool', slug: 'whizpool', clientName: 'Whizpool', industry: 'Technology / Software', service: 'Social Media Management / LinkedIn Content / Meta Ads', challenge: 'Whizpool needed stronger social media content and visibility to unlock organic lead opportunities.', solution: 'Developed LinkedIn-focused content and social media activity to improve visibility and engagement.', whatWeDid: 'Developed LinkedIn-focused content and social media activity to improve visibility and engagement.', capabilities: ['Social Media Management', 'LinkedIn Content', 'Meta Ads'], results: [{ metric: 'Known outcome', description: 'Whizpool started receiving organic leads through LinkedIn.' }], isPublished: true },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex');
  await Promise.all(services.map((item) => Service.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true, setDefaultsOnInsert: true })));
  await Promise.all(clients.map((item) => Client.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true, setDefaultsOnInsert: true })));
  await Promise.all(industries.map((item) => Industry.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true, setDefaultsOnInsert: true })));
  await Promise.all(testimonials.map((item) => Testimonial.findOneAndUpdate({ name: item.name, company: item.company }, item, { upsert: true, new: true, setDefaultsOnInsert: true })));
  await Promise.all(caseStudies.map((item) => CaseStudy.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true, setDefaultsOnInsert: true })));
  await SiteSettings.findOneAndUpdate({}, { companyName: 'Boost Vertex', email: 'boostvertex@gmail.com', salesEmail: 'boostvertex@gmail.com', phone: '03032799987', whatsapp: '03032799987', address: 'Blue Area, Islamabad, Pakistan', workingHours: 'Monday-Saturday, 10:00 AM-7:00 PM', preferredContactMethod: 'WhatsApp', secondaryContactMethod: 'Phone Call', bookingUrl: null, socialLinks: { facebook: 'https://www.facebook.com/adswithboostvertex', instagram: 'https://www.instagram.com/boostvertex', linkedin: 'https://www.linkedin.com/company/boost-vertex-pk/' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await SiteContent.findOneAndUpdate({ type: 'about' }, { type: 'about', content: { founderName: 'Tayyab Riaz', founderTitle: 'Founder, Boost Vertex', founderStory: 'Boost Vertex was founded by Tayyab Riaz with a simple goal: to help businesses turn digital marketing into real business opportunities.\n\nStarting with a strong focus on Meta Ads and Lead Generation, Boost Vertex helps businesses reach the right audiences and generate relevant leads. The agency has since expanded its capabilities to include Google Ads, YouTube Ads, SEO, and Web Development.\n\nToday, Boost Vertex works with businesses across Pakistan, the UAE, and Saudi Arabia, with a focus on lead quality, practical execution, and measurable performance.\n\nOur belief is simple: digital marketing should contribute to business growth—not just generate clicks and impressions.' } }, { upsert: true, new: true });
    await SiteContent.findOneAndUpdate({ type: 'about' }, { type: 'about', content: { founderName: 'Tayyab Riaz', founderTitle: 'Founder, Boost Vertex', founderStory: 'Boost Vertex was founded by Tayyab Riaz with a simple goal: to help businesses turn digital marketing into real business opportunities.\n\nStarting with a strong focus on Meta Ads and Lead Generation, Boost Vertex helps businesses reach the right audiences and generate relevant leads. The agency has since expanded its capabilities to include Google Ads, YouTube Ads, SEO, and Web Development.\n\nToday, Boost Vertex works with businesses across Pakistan, the UAE, and Saudi Arabia, with a focus on lead quality, practical execution, and measurable performance.\n\nOur belief is simple: digital marketing should contribute to business growth—not just generate clicks and impressions.', isPublished: true } }, { upsert: true, new: true });
  await SiteContent.findOneAndUpdate({ type: 'homepage' }, { type: 'homepage', content: { heroTitle: 'Performance Marketing That Generates Qualified Leads', heroDescription: 'Boost Vertex helps businesses across Pakistan, UAE and Saudi Arabia acquire customers through Meta Ads, lead generation and performance marketing.', primaryCtaText: 'Get a Free Consultation', primaryCtaAction: 'https://wa.me/923032799987', secondaryCtaText: 'Discuss Your Project', navigation: ['Home', 'Services', 'Industries', 'Case Studies', 'About', 'Contact'] } }, { upsert: true, new: true });
    await SiteContent.findOneAndUpdate({ type: 'homepage' }, { type: 'homepage', content: { heroTitle: 'Performance Marketing + Meta Ads + Qualified Leads', heroDescription: 'Boost Vertex helps businesses across Pakistan, UAE and Saudi Arabia acquire customers through Meta Ads, lead generation and performance marketing.', primaryCtaText: 'Get a Free Consultation', primaryCtaAction: 'https://wa.me/923032799987', secondaryCtaText: 'Discuss Your Project', navigation: ['Home', 'Services', 'Industries', 'Case Studies', 'About', 'Contact'], targetMarkets: ['Pakistan', 'United Arab Emirates', 'Saudi Arabia'], primaryServices: ['Meta Ads Management', 'Lead Generation'], isPublished: true } }, { upsert: true, new: true });
  console.log('Approved Boost Vertex content seeded successfully');
  await mongoose.disconnect();
};

run().catch(async (error) => { console.error('Content seed failed:', error.message); await mongoose.disconnect(); process.exit(1); });