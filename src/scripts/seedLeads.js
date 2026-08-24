const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('../models/Lead');

dotenv.config();

// All seeded leads share a "seed-test" source prefix so they are easy to spot in
// the Lead List and trivial to clean up later (source: /^seed-test/).
const SEED_SOURCE = 'seed-test';

// Back-date createdAt relative to the run time so date-range filters and sorting
// are testable. This is a plain Node script, so `new Date()` is fine here.
const now = new Date();
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

// Clearly-labelled test leads. Between them they cover every status, a mix of
// read/unread, a few sources, varied serviceInterest, and every monthlyBudget
// enum value (en-dash characters copied exactly from src/models/Lead.js).
// 13 leads => 2 pages at the default list limit of 10.
const leads = [
  {
    name: 'Test Lead 01 — New / Unread',
    email: 'test-lead-01@seed.boostvertex.test',
    phone: '03000000001',
    company: 'Seed Test Co 01',
    serviceInterest: 'Meta Ads Management',
    monthlyBudget: 'Under PKR 50,000',
    message: 'Seed lead: status=new, isRead=false. Safe to delete.',
    source: SEED_SOURCE,
    status: 'new',
    isRead: false,
    createdAt: daysAgo(1),
  },
  {
    name: 'Test Lead 02 — New / Read',
    email: 'test-lead-02@seed.boostvertex.test',
    phone: '03000000002',
    company: 'Seed Test Co 02',
    serviceInterest: 'Lead Generation',
    monthlyBudget: 'PKR 50,000–100,000',
    message: 'Seed lead: status=new, isRead=true. Safe to delete.',
    source: SEED_SOURCE,
    status: 'new',
    isRead: true,
    createdAt: daysAgo(3),
  },
  {
    name: 'Test Lead 03 — Contacted / Unread',
    email: 'test-lead-03@seed.boostvertex.test',
    phone: '03000000003',
    company: 'Seed Test Co 03',
    serviceInterest: 'Google Ads',
    monthlyBudget: 'PKR 100,000–250,000',
    message: 'Seed lead: status=contacted, isRead=false. Safe to delete.',
    source: SEED_SOURCE,
    status: 'contacted',
    isRead: false,
    createdAt: daysAgo(5),
  },
  {
    name: 'Test Lead 04 — Contacted / Read',
    email: 'test-lead-04@seed.boostvertex.test',
    phone: '03000000004',
    company: 'Seed Test Co 04',
    serviceInterest: 'SEO',
    monthlyBudget: 'PKR 250,000–500,000',
    message: 'Seed lead: status=contacted, isRead=true. Safe to delete.',
    source: SEED_SOURCE,
    status: 'contacted',
    isRead: true,
    createdAt: daysAgo(8),
  },
  {
    name: 'Test Lead 05 — Qualified / Unread',
    email: 'test-lead-05@seed.boostvertex.test',
    phone: '03000000005',
    company: 'Seed Test Co 05',
    serviceInterest: 'Web Development',
    monthlyBudget: 'PKR 500,000+',
    message: 'Seed lead: status=qualified, isRead=false. Safe to delete.',
    source: SEED_SOURCE,
    status: 'qualified',
    isRead: false,
    createdAt: daysAgo(11),
  },
  {
    name: 'Test Lead 06 — Qualified / Read',
    email: 'test-lead-06@seed.boostvertex.test',
    phone: '03000000006',
    company: 'Seed Test Co 06',
    serviceInterest: 'YouTube Ads',
    monthlyBudget: 'PKR 100,000–250,000',
    message: 'Seed lead: status=qualified, isRead=true. Safe to delete.',
    source: SEED_SOURCE,
    status: 'qualified',
    isRead: true,
    createdAt: daysAgo(14),
  },
  {
    name: 'Test Lead 07 — Won / Read',
    email: 'test-lead-07@seed.boostvertex.test',
    phone: '03000000007',
    company: 'Seed Test Co 07',
    serviceInterest: 'Meta Ads Management',
    monthlyBudget: 'PKR 250,000–500,000',
    message: 'Seed lead: status=won, isRead=true. Safe to delete.',
    source: SEED_SOURCE,
    status: 'won',
    isRead: true,
    createdAt: daysAgo(18),
  },
  {
    name: 'Test Lead 08 — Won / Unread',
    email: 'test-lead-08@seed.boostvertex.test',
    phone: '03000000008',
    company: 'Seed Test Co 08',
    serviceInterest: 'Lead Generation',
    monthlyBudget: 'PKR 500,000+',
    message: 'Seed lead: status=won, isRead=false. Safe to delete.',
    source: SEED_SOURCE,
    status: 'won',
    isRead: false,
    createdAt: daysAgo(22),
  },
  {
    name: 'Test Lead 09 — Lost / Read',
    email: 'test-lead-09@seed.boostvertex.test',
    phone: '03000000009',
    company: 'Seed Test Co 09',
    serviceInterest: 'Google Ads',
    monthlyBudget: 'Under PKR 50,000',
    message: 'Seed lead: status=lost, isRead=true. Safe to delete.',
    source: SEED_SOURCE,
    status: 'lost',
    isRead: true,
    createdAt: daysAgo(27),
  },
  {
    name: 'Test Lead 10 — Lost / Unread',
    email: 'test-lead-10@seed.boostvertex.test',
    phone: '03000000010',
    company: 'Seed Test Co 10',
    serviceInterest: 'SEO',
    monthlyBudget: 'PKR 50,000–100,000',
    message: 'Seed lead: status=lost, isRead=false. Safe to delete.',
    source: SEED_SOURCE,
    status: 'lost',
    isRead: false,
    createdAt: daysAgo(31),
  },
  {
    name: 'Test Lead 11 — New / Referral source',
    email: 'test-lead-11@seed.boostvertex.test',
    phone: '03000000011',
    company: 'Seed Test Co 11',
    serviceInterest: 'Social Media Management',
    monthlyBudget: 'PKR 100,000–250,000',
    message: 'Seed lead: status=new, isRead=false, source=seed-test-referral. Safe to delete.',
    source: 'seed-test-referral',
    status: 'new',
    isRead: false,
    createdAt: daysAgo(35),
  },
  {
    name: 'Test Lead 12 — Contacted / Ad source',
    email: 'test-lead-12@seed.boostvertex.test',
    phone: '03000000012',
    company: 'Seed Test Co 12',
    serviceInterest: 'Meta Ads Management',
    monthlyBudget: 'PKR 250,000–500,000',
    message: 'Seed lead: status=contacted, isRead=true, source=seed-test-ad. Safe to delete.',
    source: 'seed-test-ad',
    status: 'contacted',
    isRead: true,
    createdAt: daysAgo(39),
  },
  {
    name: 'Test Lead 13 — Qualified / High budget',
    email: 'test-lead-13@seed.boostvertex.test',
    phone: '03000000013',
    company: 'Seed Test Co 13',
    serviceInterest: 'Lead Generation',
    monthlyBudget: 'PKR 500,000+',
    message: 'Seed lead: status=qualified, isRead=false. Safe to delete.',
    source: SEED_SOURCE,
    status: 'qualified',
    isRead: false,
    createdAt: daysAgo(44),
  },
];

const run = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
  await mongoose.connect(mongoUri);

  // Upsert by email so re-runs update in place instead of duplicating.
  // timestamps:false lets us set createdAt explicitly for date-filter testing.
  await Promise.all(
    leads.map((lead) =>
      Lead.updateOne(
        { email: lead.email },
        { $set: { ...lead, updatedAt: now } },
        { upsert: true, timestamps: false }
      )
    )
  );

  const total = await Lead.countDocuments({ source: /^seed-test/ });
  console.log(`Seeded ${leads.length} labelled test leads (source starts with "seed-test").`);
  console.log(`Total seed-test leads now in DB: ${total}`);
  console.log('Cleanup later with: Lead.deleteMany({ source: /^seed-test/ })');

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Lead seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
