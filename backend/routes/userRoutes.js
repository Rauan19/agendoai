const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Simple user routes - basic CRUD operations
router.get('/profile', auth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('address').optional().trim()
], async (req, res) => {
  try {
    const User = require('../models/User');
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;