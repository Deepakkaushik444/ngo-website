const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Post = require('./models/Post');
const contactRoutes = require("./routes/contact");
const volunteerRoutes = require("./routes/volunteer");
const User = require('./models/User');
const upload = require("./middleware/uploadMiddleware");
const app = express();
const imageRoutes = require('./routes/images');
const registrationRoutes = require('./routes/registrations');
const programRoutes = require('./routes/programs');
const Donation = require('./models/Donation');

app.use(cors());

app.use(express.json({ limit: '10mb' }));

app.use('/api/registrations', registrationRoutes);

app.use('/api/images', imageRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/programs', programRoutes);




// ✅ CORS (ONLY ONCE)

//app.use(cors({
 // origin: "http://localhost:5173",
//  credentials: true
//}));


// ✅ MongoDB (use ONE only)
mongoose.connect(process.env.MONGO_URI, {
  writeConcern: { w: 1 }
})
.then(() => {
  console.log("MongoDB connected ✅");
  console.log("DB NAME:", mongoose.connection.name);
  console.log("HOST:", mongoose.connection.host);
})
.catch(err => console.log("DB error:", err));
// ================= ROUTES =================



// GET all donations (with optional status & search)
app.get('/api/donations', async (req, res) => {
  try {
    let filter = {};
    if (req.query.status && req.query.status !== 'all')
      filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { donorName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { transactionId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const donations = await Donation.find(filter).sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new donation (including QR payment)
app.post('/api/donations', async (req, res) => {
  try {
    const donation = new Donation(req.body);
    const saved = await donation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update status
app.patch('/api/donations/:id/status', async (req, res) => {
  try {
    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// GET users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});



// 🔥 Upload video
app.post("/api/posts/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    const { title, description } = req.body;

    const newPost = new Post({
      title,
      description,
      videoUrl: req.file.path
    });

    const saved = await newPost.save();
    res.status(201).json(saved);

  } 
  catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
});
// ADD user
app.post('/api/users', async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      joinDate: new Date(),
      lastActive: new Date()
    });

    const saved = await user.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE user
app.put('/api/users/:id', async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});


// 🔥 DELETE video (FIXED)
const cloudinary = require("./config/cloudinary");

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Video not found ❌" });
    }

    const videoUrl = post.videoUrl;
    const parts = videoUrl.split("/");
    const uploadIndex = parts.findIndex(p => p === "upload");

    let publicId = "";

    if (uploadIndex !== -1) {
      publicId = parts.slice(uploadIndex + 2).join("/").split(".")[0];
    }

    if (publicId) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "video"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully ✅" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE STATUS
app.patch('/api/users/:id/status', async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, lastActive: new Date() },
    { new: true }
  );
  res.json(updated);
});

// ================= POSTS ROUTES =================

// GET all videos
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

const nodemailer = require("nodemailer");

// Configure email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email (e.g., admin@gmail.com)
    pass: process.env.EMAIL_PASS, // App password (not regular password)
  },
});





app.get('/api/debug', async (req, res) => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  const raw = await mongoose.connection.db.collection("posts").find().toArray();

  console.log("Collections:", collections.map(c => c.name));
  console.log("Raw Data:", raw);

  res.json(raw);
});

app.listen(5000, () => console.log("Server running on 5000 🚀"));