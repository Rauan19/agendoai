const mongoose = require('mongoose');

const nicheSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Niche name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Niche', nicheSchema);