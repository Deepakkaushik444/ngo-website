const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require('dotenv').config();

// ✅ Force IPv4 by explicitly defining host/port/secure + family:4
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,                // <-- change from 465 to 587
  secure: false,            // <-- false for port 587 (STARTTLS)
  family: 4,                // keep this
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",       // sometimes needed for Gmail
    rejectUnauthorized: true,
  },
});

// Verify connection (optional but helpful)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Transporter Error:", error);
  } else {
    console.log("✅ Mail server ready (IPv4 forced)");
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thanks for contacting us - ${subject}`,
      html: `<h2>Hello ${name}</h2><p>We received your message:</p><p>${message}</p><br/><p>We will contact you soon.</p>`,
    });

    // Email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: `<h3>New Contact Form</h3><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Subject:</b> ${subject}</p><p><b>Message:</b> ${message}</p>`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send mail error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;