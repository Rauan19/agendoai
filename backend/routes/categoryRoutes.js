const express = require('express');
const Category = require('../models/Category');
const Niche = require('../models/Niche');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { nicheId } = req.query;
    const query = nicheId ? { nicheId } : {};
    
    const categories = await Category.find(query)
      .populate('nicheId', 'name')
      .populate('parentId', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all niches
router.get('/niches', async (req, res) => {
  try {
    const niches = await Niche.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: niches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;