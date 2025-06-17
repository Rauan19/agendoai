const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Availability = require('../models/Availability');

const router = express.Router();

// Get all providers
router.get('/', async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 10 } = req.query;
    
    let query = { userType: 'provider', isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const providers = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    // If categoryId is provided, filter providers who offer services in that category
    let filteredProviders = providers;
    if (categoryId) {
      const servicesInCategory = await Service.find({ categoryId, isActive: true });
      const providerIds = servicesInCategory.map(service => service.providerId);
      filteredProviders = providers.filter(provider => 
        providerIds.some(id => id.toString() === provider._id.toString())
      );
    }

    const total = filteredProviders.length;

    res.json({
      success: true,
      data: filteredProviders,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get provider details
router.get('/:id', async (req, res) => {
  try {
    const provider = await User.findOne({ 
      _id: req.params.id, 
      userType: 'provider', 
      isActive: true 
    }).select('-password');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Get provider services
    const services = await Service.find({ 
      providerId: req.params.id, 
      isActive: true 
    }).populate('categoryId', 'name icon');

    // Get provider availability
    const availability = await Availability.find({ 
      providerId: req.params.id, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        ...provider.toObject(),
        services,
        availability
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;