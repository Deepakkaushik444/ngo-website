const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'qr_code' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending','completed','failed'], default: 'pending' },
  date: { type: Date, default: Date.now },
  transactionId: { type: String, unique: true, required: true },
  paymentProof: { type: String, default: null } // base64 image
});

module.exports = mongoose.model('Donation', donationSchema);