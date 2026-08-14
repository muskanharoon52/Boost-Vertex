const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
    await mongoose.connect(mongoUri);

    const email = process.env.ADMIN_EMAIL || 'admin@boostvertex.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'Boost Vertex Admin',
      email,
      password,
      role: 'admin',
    });

    console.log('Admin created successfully');
    console.log({
      id: admin._id,
      email: admin.email,
      password,
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed admin failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
