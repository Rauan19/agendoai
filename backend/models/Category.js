const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
  },
  color: {
    type: String
  },
  nicheId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Niche',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);