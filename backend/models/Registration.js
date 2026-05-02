const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  schoolName: { type: String, required: true },
});

const registrationSchema = new mongoose.Schema({
  eventId: { type:String, required: true },
  eventTitle: { type: String, required: true },
  groupSize: { type: Number, required: true, min: 1, max: 4 },
  members: [memberSchema],
  generatedId: { type: String, required: true, unique: true },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Registration', registrationSchema);