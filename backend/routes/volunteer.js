const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/User"); // adjust path to your User model

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/volunteer
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered." });
    }

    // Create new volunteer user
    const newVolunteer = new User({
      name,
      email,
      phone,
      message,          // make sure your schema has this field
      role: "volunteer",
      status: "pending",
      joinDate: new Date()
    });

    await newVolunteer.save();

    // Send confirmation email to volunteer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Volunteer Application Received",
      html: `<h2>Hello ${name}</h2>
             <p>Thank you for applying as a volunteer.</p>
             <p>We will contact you soon.</p>`
    });

    // Send notification to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Volunteer Application",
      html: `<h3>New Volunteer</h3>
             <p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Phone:</b> ${phone}</p>
             <p><b>Message:</b> ${message}</p>`
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Volunteer Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/volunteers
router.get("/volunteers", async (req, res) => {
  try {
    const volunteers = await User.find({ role: "volunteer" })
      .select("name email phone message joinDate status")
      .sort({ joinDate: -1 });
    res.status(200).json({ success: true, volunteers });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;