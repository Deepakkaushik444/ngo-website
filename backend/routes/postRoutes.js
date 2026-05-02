const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { uploadVideo } = require("../controllers/postController");

router.post("/upload", upload.single("video"), uploadVideo);



// server.js or routes/posts.js

const Post = require('./models/Post'); // your schema

// GET all posts
router.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a post
router.delete('/api/posts/:id', async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a post (optional, for editing)
router.put('/api/posts/:id', async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description, category: req.body.category },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST to increment view count (optional)
router.put('/api/posts/:id/view', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;