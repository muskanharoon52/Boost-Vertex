const Admin = require('../models/Admin');
const { generateToken } = require('../utils/generateToken');
const crypto = require('crypto');
const { sendEmail } = require('../config/mailer');
const { getCloudinary } = require('../config/cloudinary');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordResetResponse = 'If an account exists for this email, a password reset link has been sent.';

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, { status: 400, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return sendError(res, { status: 401, message: 'Invalid email or password' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return sendError(res, { status: 401, message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id);
    return sendSuccess(res, {
      message: 'Login successful',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token,
      },
      extra: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token,
      },
    });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to login' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).lean();
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    const { password, resetPasswordToken, resetPasswordExpires, ...safeAdmin } = admin;
    return sendSuccess(res, {
      message: 'Profile fetched successfully',
      data: safeAdmin,
      extra: {
        _id: safeAdmin._id,
        name: safeAdmin.name,
        email: safeAdmin.email,
        jobTitle: safeAdmin.jobTitle,
        department: safeAdmin.department,
        bio: safeAdmin.bio,
        language: safeAdmin.language,
        timezone: safeAdmin.timezone,
        avatarUrl: safeAdmin.avatarUrl,
      },
    });
  } catch (error) {
    return sendError(res, { status: 500, message: error.message || 'Unable to fetch profile' });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    const allowedFields = ['name', 'email', 'jobTitle', 'department', 'bio', 'language', 'timezone'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'email' ? String(req.body[field]).trim().toLowerCase() : String(req.body[field]).trim();
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, { status: 400, message: 'No profile fields provided for update' });
    }

    if (updates.email && !emailPattern.test(updates.email)) {
      return sendError(res, { status: 400, message: 'A valid email is required' });
    }

    if (updates.email) {
      const duplicateAdmin = await Admin.findOne({ email: updates.email, _id: { $ne: admin._id } });
      if (duplicateAdmin) {
        return sendError(res, { status: 409, message: 'Another admin already uses this email' });
      }
    }

    Object.assign(admin, updates);
    await admin.save();

    const { password: _password, resetPasswordToken: _resetToken, resetPasswordExpires: _resetExpires, ...safeAdmin } = admin.toObject();
    return sendSuccess(res, {
      message: 'Profile updated successfully',
      data: safeAdmin,
      extra: {
        _id: safeAdmin._id,
        name: safeAdmin.name,
        email: safeAdmin.email,
        jobTitle: safeAdmin.jobTitle,
        department: safeAdmin.department,
        bio: safeAdmin.bio,
        language: safeAdmin.language,
        timezone: safeAdmin.timezone,
        avatarUrl: safeAdmin.avatarUrl,
      },
    });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, { status: 400, message: 'Current password, new password, and password confirmation are required' });
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, { status: 400, message: 'New password and confirmation do not match' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return sendError(res, { status: 400, message: 'New password must be at least 8 characters' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    const matchesCurrent = await admin.matchPassword(currentPassword);
    if (!matchesCurrent) {
      return sendError(res, { status: 401, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();
    return sendSuccess(res, { message: 'Password updated successfully', data: null });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to change password' });
  }
};

const updateAdminAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, { status: 400, message: 'A profile image file is required' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    try {
      const { result } = await uploadBufferToCloudinary(req.file, 'boost-vertex/admin-avatars');
      const cloudinary = getCloudinary();

      if (admin.avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(admin.avatarPublicId, { resource_type: 'image' });
        } catch (destroyError) {
          console.warn('Failed to remove previous admin avatar:', destroyError.message);
        }
      }

      admin.avatarUrl = result.secure_url;
      admin.avatarPublicId = result.public_id;
      await admin.save();

      return sendSuccess(res, { message: 'Profile picture updated successfully', data: admin });
    } catch (uploadError) {
      if (/not configured/i.test(uploadError.message || '')) return sendError(res, { status: 503, message: uploadError.message });
      throw uploadError;
    }
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to update profile picture' });
  }
};

const removeAdminAvatar = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return sendError(res, { status: 404, message: 'Admin not found' });

    if (admin.avatarPublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(admin.avatarPublicId, { resource_type: 'image' });
      } catch (destroyError) {
        console.warn('Failed to remove admin avatar from cloudinary:', destroyError.message);
      }
    }

    admin.avatarUrl = '';
    admin.avatarPublicId = '';
    await admin.save();

    return sendSuccess(res, { message: 'Profile picture removed successfully', data: admin });
  } catch (error) {
    return sendError(res, { status: 400, message: error.message || 'Unable to remove profile picture' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!emailPattern.test(email)) {
      return sendError(res, { status: 400, message: 'A valid email is required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return sendSuccess(res, { message: passwordResetResponse, data: null });
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

    return sendSuccess(res, { message: passwordResetResponse, data: null });
  } catch (error) {
    return sendError(res, { status: 500, message: 'Unable to process password reset request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== 'string') return sendError(res, { status: 400, message: 'Reset token is required' });
    if (typeof password !== 'string' || password.length < 8) {
      return sendError(res, { status: 400, message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!admin) return sendError(res, { status: 400, message: 'Reset token is invalid or expired' });

    await admin.setPassword(password);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return sendSuccess(res, { message: 'Password reset successfully', data: null });
  } catch (error) {
    return sendError(res, { status: 500, message: 'Unable to reset password' });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  updateAdminAvatar,
  removeAdminAvatar,
  forgotPassword,
  resetPassword,
};
