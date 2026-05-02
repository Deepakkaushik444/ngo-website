const express = require('express');
const Program = require('../models/Program');
const router = express.Router();

// GET all programs (public)
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// GET single program
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ error: 'Not found' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// POST (admin only – add auth middleware in production)
router.post('/', async (req, res) => {
  try {
    const { title, desc, icon, shortDetails, longDetails, image } = req.body;
    const program = new Program({ title, desc, icon, shortDetails, longDetails, image });
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// PUT (admin only)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// DELETE (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Program.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

module.exports = router;