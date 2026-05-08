const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ✅ SMTP transporter with port 587 (STARTTLS) – less likely to be blocked
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,               // true for 465, false for 587
  family: 4,                   // keep IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: true,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Transporter error:', error.message);
  } else {
    console.log('✅ Mail server ready (IPv4, port 587)');
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Auto-reply to the user
    await transporter.sendMail({
      from: `"NGO Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting us – ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2c7da0;">Hello ${name},</h2>
          <p>We have received your message:</p>
          <blockquote style="background: #f4f4f4; padding: 10px; border-left: 4px solid #2c7da0;">
            ${message}
          </blockquote>
          <p>Our team will get back to you within 24 hours.</p>
          <hr />
          <p style="font-size: 12px; color: #777;">NGO Foundation – Building a better tomorrow.</p>
        </div>
      `,
    });

    // 2. Notification to admin
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact: ${subject}`,
      html: `
        <h3>New message from ${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    return res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Send mail error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;