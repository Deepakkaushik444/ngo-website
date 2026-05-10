// models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certId: { type: String, unique: true, required: true },
  recipientName: { type: String, required: true },
  ngoName: String,
  certificateType: String,
  description: String,
  issueDate: Date,
  expiryDate: Date,
  certificateNumber: String,
  signatureName: String,
  signatureTitle: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);