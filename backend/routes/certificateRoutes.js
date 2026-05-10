// routes/certificateRoutes.js
const express = require('express');
const router = express.Router();

// Certificate Schema (you can also put this in models/Certificate.js)
const Certificate = require('../models/Certificate'); // we'll create this next

// POST /api/certificates – save a new certificate (or update if exists)
router.post('/', async (req, res) => {
  try {
    const { certId, ...data } = req.body;
    const existing = await Certificate.findOne({ certId });
    if (existing) {
      await Certificate.updateOne({ certId }, data);
      return res.json({ success: true, message: 'Certificate updated', certId });
    }
    const newCert = new Certificate({ certId, ...data });
    await newCert.save();
    res.json({ success: true, certId });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/verify/:certId – used by QR landing page
router.get('/verify/:certId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certId: req.params.certId });
    if (!cert) {
      return res.status(404).json({ valid: false, message: 'Certificate not found in official records. This is NOT a genuine certificate.' });
    }
    res.json({ valid: true, data: cert });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;