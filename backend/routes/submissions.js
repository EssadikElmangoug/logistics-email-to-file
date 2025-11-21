import express from 'express';
import { body, validationResult } from 'express-validator';
import Submission from '../models/Submission.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/submissions
// @desc    Save a submission
// @access  Private
router.post(
  '/',
  protect,
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('shipper.city').notEmpty().withMessage('Shipper city is required'),
    body('shipper.stateOrProvince').notEmpty().withMessage('Shipper state/province is required'),
    body('receiver.city').notEmpty().withMessage('Receiver city is required'),
    body('receiver.stateOrProvince').notEmpty().withMessage('Receiver state/province is required'),
    body('details.weightLbs').notEmpty().withMessage('Weight is required'),
    body('details.serviceType').notEmpty().withMessage('Service type is required'),
    body('fileType').isIn(['word', 'excel', 'pdf']).withMessage('Invalid file type'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const submissionData = {
        ...req.body,
        user: req.user._id,
      };

      const submission = await Submission.create(submissionData);

      res.status(201).json({
        _id: submission._id,
        message: 'Submission saved successfully',
      });
    } catch (error) {
      console.error('Save submission error:', error);
      res.status(500).json({ message: 'Server error during submission save' });
    }
  }
);

// @route   GET /api/submissions
// @desc    Get user's own submissions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username email');
    
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

