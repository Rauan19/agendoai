const express = require('express');
const { body } = require('express-validator');
const { 
  getAppointments, 
  getAppointment, 
  createAppointment, 
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const appointmentValidation = [
  body('providerId')
    .isMongoId()
    .withMessage('Valid provider ID is required'),
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

// Routes
router.get('/', auth, getAppointments);
router.get('/:id', auth, getAppointment);
router.post('/', auth, appointmentValidation, createAppointment);
router.put('/:id', auth, updateAppointment);
router.put('/:id/cancel', auth, cancelAppointment);

module.exports = router;