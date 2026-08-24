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
    const name = process.env.ADMIN_NAME || 'Boost Vertex Admin';

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      // Idempotently reset name/role/password to the documented .env values so the
      // credentials always work for login + dashboard. Assigning `password` marks it
      // modified, so the model's pre('save') hook re-hashes it (findOneAndUpdate would
      // skip the hook and store a plaintext password that could never match on login).
      existingAdmin.name = name;
      existingAdmin.role = 'admin';
      existingAdmin.password = password;
      await existingAdmin.save();

      console.log('Admin credentials reset successfully');
      console.log({ id: existingAdmin._id, email: existingAdmin.email, password });
      process.exit(0);
    }

    const admin = await Admin.create({
      name,
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
