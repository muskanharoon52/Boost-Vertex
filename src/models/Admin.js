const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'admin',
    },
    jobTitle: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    avatarPublicId: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      trim: true,
      default: 'en',
    },
    timezone: {
      type: String,
      trim: true,
      default: 'UTC',
    },
    notificationEmail: {
      type: String,
      trim: true,
      default: '',
    },
    notificationPrefs: {
      newContactMessage: { type: Boolean, default: true },
      newLead: { type: Boolean, default: true },
      leadUpdated: { type: Boolean, default: true },
      leadDeleted: { type: Boolean, default: true },
      serviceUpdated: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.setPassword = async function (newPassword) {
  this.password = newPassword;
};

module.exports = mongoose.model('Admin', adminSchema);
