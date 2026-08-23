const Admin = require('../models/Admin');
const { generateToken } = require('../utils/generateToken');
const crypto = require('crypto');
const { sendEmail } = require('../config/mailer');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordResetResponse = 'If an account exists for this email, a password reset link has been sent.';

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to register admin' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to login' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch profile' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(200).json({ message: passwordResetResponse });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    admin.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    const frontendUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/admin/reset-password?token=${rawToken}`;

    await sendEmail({
      to: admin.email,
      subject: 'Boost Vertex admin password reset',
      html: `<p>A password reset was requested for your Boost Vertex admin account.</p><p>This link expires in 15 minutes:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
      text: `Reset your Boost Vertex admin password within 15 minutes: ${resetUrl}`,
    });

    return res.status(200).json({ message: passwordResetResponse });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process password reset request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== 'string') return res.status(400).json({ message: 'Reset token is required' });
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!admin) return res.status(400).json({ message: 'Reset token is invalid or expired' });

    await admin.setPassword(password);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to reset password' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  forgotPassword,
  resetPassword,
};
