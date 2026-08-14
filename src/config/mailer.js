const nodemailer = require('nodemailer');

const hasConfiguredSmtp = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return Boolean(host && user && pass && user !== 'your_email@gmail.com');
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasConfiguredSmtp()) {
    console.warn('SMTP is not configured; skipping lead email notification.');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Boost Vertex <noreply@example.com>',
      to,
      subject,
      html,
      text,
    });

    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return null;
  }
};

module.exports = { sendEmail };
