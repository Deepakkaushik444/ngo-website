const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // ← your config file
const Image = require('../models/Image');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/images/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ngo_gallery',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const newImage = new Image({
      title,
      description,
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
    });

    await newImage.save();
    res.status(201).json({ success: true, image: newImage });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// GET /api/images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// DELETE /api/images/:id
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    await image.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});
// PUT /api/images/:id – Update image title/description
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    if (title) image.title = title;
    if (description) image.description = description;
    
    await image.save();
    res.json({ success: true, image });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/images/:id – Delete from Cloudinary and DB
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Delete from Cloudinary using public_id
    await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    
    // Delete from database
    await image.deleteOne();
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});
module.exports = router;