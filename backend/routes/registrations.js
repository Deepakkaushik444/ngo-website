const express = require('express');
const Registration = require('../models/Registration');
const router = express.Router();

// Helper: generate unique 6-digit ID
const generateUniqueId = async () => {
  let id;
  let exists = true;
  while (exists) {
    id = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Registration.findOne({ generatedId: id });
  }
  return id;
};

// POST /api/registrations/register
router.post('/register', async (req, res) => {
  try {

    console.log('📥 Received body:', req.body);
console.log('eventId:', req.body.eventId, 'type:', typeof req.body.eventId);
console.log('groupSize:', req.body.groupSize, 'type:', typeof req.body.groupSize);
console.log('members length:', req.body.members?.length);
    const { eventId, eventTitle, members } = req.body;
    const groupSize = Number(req.body.groupSize);
    if (!eventId || !groupSize || !members || members.length !== groupSize) {
      return res.status(400).json({ error: 'Invalid registration data' });
    }

    const generatedId = await generateUniqueId();
    const registration = new Registration({
      eventId,
      eventTitle,
      groupSize,
      members,
      generatedId,
    });
    await registration.save();
    res.status(201).json({ success: true, generatedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/registrations?eventId=... or ?eventTitle=...
router.get('/', async (req, res) => {
  try {
    const { eventId, eventTitle } = req.query;
    let filter = {};
    if (eventId) filter.eventId = eventId;
    if (eventTitle) filter.eventTitle = eventTitle;
    const registrations = await Registration.find(filter).sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// DELETE /api/registrations/:id
router.delete('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    await registration.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;