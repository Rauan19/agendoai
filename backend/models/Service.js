const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  nicheId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Niche'
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: 1
  },
  executionTime: {
    type: Number,
    required: true,
    min: 1
  },
  breakTime: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);