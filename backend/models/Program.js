const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String, default: '📚' },
  shortDetails: { type: String, required: true },
  longDetails: { type: String, required: true },
  image: { type: String, default: 'https://picsum.photos/id/20/800/600' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Program', programSchema);