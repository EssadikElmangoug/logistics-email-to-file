import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/shipment/extract
// @desc    Extract shipment data from email text (protected route)
// @access  Private
router.post(
  '/extract',
  protect,
  [
    body('emailText')
      .notEmpty()
      .withMessage('Email text is required')
      .isLength({ min: 10 })
      .withMessage('Email text must be at least 10 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { emailText } = req.body;

      // This endpoint is protected and authorized
      // The actual extraction logic will be called from the frontend
      // or you can move the geminiService here if needed
      
      res.json({
        message: 'Extraction endpoint - authorized',
        user: req.user.username,
        // You can add extraction logic here if needed
      });
    } catch (error) {
      console.error('Extraction error:', error);
      res.status(500).json({ message: 'Server error during extraction' });
    }
  }
);

export default router;



