const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, date, providerId, clientId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter based on user type
    if (req.user.userType === 'provider') {
      query.providerId = req.user.id;
    } else if (req.user.userType === 'client') {
      query.clientId = req.user.id;
    }
    
    // Override filters for admin
    if (req.user.userType === 'admin') {
      if (providerId) query.providerId = providerId;
      if (clientId) query.clientId = clientId;
    }
    
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email phone profileImage')
      .populate('providerId', 'name email phone profileImage')
      .populate('serviceId', 'name duration price')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, startTime: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId', 'name email phone profileImage address')
      .populate('providerId', 'name email phone profileImage address')
      .populate('serviceId', 'name description duration price');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (req.user.userType !== 'admin' && 
        appointment.clientId._id.toString() !== req.user.id.toString() &&
        appointment.providerId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { providerId, serviceId, date, startTime, endTime, notes } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId).populate('providerId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if provider matches service provider
    if (service.providerId._id.toString() !== providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider does not offer this service'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      providerId,
      date: new Date(date),
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        }
      ],
      status: { $nin: ['cancelled'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    const appointment = await Appointment.create({
      clientId: req.user.id,
      providerId,
      serviceId,
      date: new Date(date),
      startTime,
      endTime,
      duration: service.duration,
      price: service.price,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('serviceId', 'name duration price');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.userType !== 'admin' &&
        appointment.clientId.toString() !== req.user.id.toString() &&
        appointment.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email phone')
     .populate('providerId', 'name email phone')
     .populate('serviceId', 'name duration price');

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.userType !== 'admin' &&
        appointment.clientId.toString() !== req.user.id.toString() &&
        appointment.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = req.user.id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
};