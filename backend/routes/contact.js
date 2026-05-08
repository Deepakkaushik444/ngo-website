const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require('dotenv').config();


// ✅ Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verify transporter (VERY IMPORTANT)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Transporter Error:", error);
  } else {
    console.log("✅ Mail server ready");
  }
});

// ✅ Route
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;   // ✅ use subject

    // Email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thanks for contacting us - ${subject}`,   // ✅ now defined
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
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;