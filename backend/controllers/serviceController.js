const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { categoryId, providerId, search, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (categoryId) query.categoryId = categoryId;
    if (providerId) query.providerId = providerId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query)
      .populate('providerId', 'name profileImage')
      .populate('categoryId', 'name icon')
      .populate('nicheId', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providerId', 'name profileImage phone address')
      .populate('categoryId', 'name icon')
      .populate('nicheId', 'name');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { categoryId, nicheId, name, description, price, duration, executionTime, breakTime } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const service = await Service.create({
      providerId: req.user.id,
      categoryId,
      nicheId,
      name,
      description,
      price,
      duration,
      executionTime,
      breakTime: breakTime || 0
    });

    const populatedService = await Service.findById(service._id)
      .populate('providerId', 'name profileImage')
      .populate('categoryId', 'name icon')
      .populate('nicheId', 'name');

    res.status(201).json({
      success: true,
      data: populatedService
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns the service
    if (service.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('providerId', 'name profileImage')
     .populate('categoryId', 'name icon')
     .populate('nicheId', 'name');

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns the service
    if (service.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};