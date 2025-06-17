const express = require('express');
const { body } = require('express-validator');
const { 
  getServices, 
  getService, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const serviceValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Service name must be at least 2 characters'),
  body('categoryId')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('executionTime')
    .isInt({ min: 1 })
    .withMessage('Execution time must be a positive integer'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('breakTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Break time must be a non-negative integer')
];

// Routes
router.get('/', getServices);
router.get('/:id', getService);
router.post('/', auth, authorize('provider'), serviceValidation, createService);
router.put('/:id', auth, authorize('provider'), serviceValidation, updateService);
router.delete('/:id', auth, authorize('provider'), deleteService);

module.exports = router;