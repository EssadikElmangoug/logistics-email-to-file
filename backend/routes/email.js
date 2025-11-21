import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { generatePDFBuffer } from '../utils/generatePDF.js';
import { sendEmailWithPDF } from '../utils/emailService.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// @route   GET /api/email/test
// @desc    Test email configuration
// @access  Private
router.get('/test', protect, async (req, res) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration missing',
        details: {
          SMTP_USER: process.env.SMTP_USER ? 'Set' : 'NOT SET',
          SMTP_PASS: process.env.SMTP_PASS ? `Set (${process.env.SMTP_PASS.length} chars)` : 'NOT SET',
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    res.json({
      success: true,
      message: 'Email configuration is valid',
      details: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER,
        passLength: process.env.SMTP_PASS.length,
      },
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: error.message,
      details: {
        code: error.code,
        response: error.response,
        troubleshooting: error.code === 'EAUTH' 
          ? 'Check: 1) SMTP_USER is full email (yourname@gmail.com), 2) SMTP_PASS is 16-char app password (no spaces), 3) 2-Step Verification enabled, 4) App password generated correctly'
          : 'Check your SMTP configuration',
      },
    });
  }
});

// @route   POST /api/email/send-pricing
// @desc    Send shipment PDF to pricing email
// @access  Private
router.post(
  '/send-pricing',
  protect,
  [
    body('email').optional().isEmail().withMessage('Please provide a valid email address'),
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

      // Use email from request or fall back to env variable
      const pricingEmail = email || process.env.PRICING_EMAIL;
      
      if (!pricingEmail) {
        return res.status(400).json({ 
          message: 'Pricing email is required. Please provide an email or set PRICING_EMAIL in environment variables.' 
        });
      }

      // Generate PDF buffer
      const pdfBuffer = generatePDFBuffer(shipmentData);

      // Send email with PDF attachment
      const result = await sendEmailWithPDF(pricingEmail, pdfBuffer, shipmentData.customerName);

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
