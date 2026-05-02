const Post = require("../models/Post");

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    const videoUrl = req.file.path;

    const newPost = new Post({
      title,
      description,
      videoUrl,
    });

    await newPost.save();

    res.status(201).json({
      message: "Video uploaded to Cloudinary ✅",
      data: newPost,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
