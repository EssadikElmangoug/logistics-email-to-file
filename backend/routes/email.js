import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { generatePDFBuffer } from '../utils/generatePDF.js';
import { sendEmailWithPDF } from '../utils/emailService.js';

const router = express.Router();

// @route   POST /api/email/send-pricing
// @desc    Send shipment PDF to pricing email
// @access  Private
router.post(
  '/send-pricing',
  protect,
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('shipper.city').notEmpty().withMessage('Shipper city is required'),
    body('shipper.stateOrProvince').notEmpty().withMessage('Shipper state/province is required'),
    body('receiver.city').notEmpty().withMessage('Receiver city is required'),
    body('receiver.stateOrProvince').notEmpty().withMessage('Receiver state/province is required'),
    body('details.weightLbs').notEmpty().withMessage('Weight is required'),
    body('details.serviceType').notEmpty().withMessage('Service type is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, ...shipmentData } = req.body;

      // Generate PDF buffer
      const pdfBuffer = generatePDFBuffer(shipmentData);

      // Send email with PDF attachment
      const result = await sendEmailWithPDF(email, pdfBuffer, shipmentData.customerName);

      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      });
    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({
        message: error.message || 'Failed to send email. Please check your email configuration.',
      });
    }
  }
);

export default router;

