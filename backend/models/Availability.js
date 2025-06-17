const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  date: {
    type: Date // For specific date availability
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
availabilitySchema.index({ providerId: 1, dayOfWeek: 1 });
availabilitySchema.index({ providerId: 1, date: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);