const nodemailer = require('nodemailer');

function createTransport() {
  // Support SMTP or Ethereal for dev
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: process.env.ETHEREAL_USER || '', pass: process.env.ETHEREAL_PASS || '' },
  });
}

const transporter = createTransport();

async function sendMail({ to, subject, html }) {
  const from = process.env.MAIL_FROM || 'Reaglex <no-reply@reaglex.local>'; 
  const info = await transporter.sendMail({ from, to, subject, html });
  return info;
}

module.exports = { sendMail };


