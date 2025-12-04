import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import { protect, authorize } from '../middleware/auth.js';
import generateToken from '../utils/generateToken.js';
import XLSX from 'xlsx';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user with custom or random credentials
// @access  Private/Admin
router.post(
  '/users',
  [
    body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { username, password, email } = req.body;
      let finalUsername = username;
      let finalPassword = password;

      // If username not provided, generate random one
      if (!finalUsername) {
        finalUsername = `user_${Math.random().toString(36).substring(2, 11)}`;
      }

      // If password not provided, generate random one
      if (!finalPassword) {
        finalPassword = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) + 
                       Math.floor(Math.random() * 10);
      }

      // Check if username already exists
      const userExists = await User.findOne({ username: finalUsername });
      if (userExists) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await User.create({
        username: finalUsername,
        password: finalPassword,
        email,
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        password: finalPassword, // Return password only on creation
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Create user error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      res.status(500).json({ message: 'Server error during user creation' });
    }
  }
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put(
  '/users/:id',
  [
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['user', 'admin']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const userId = req.params.id;
      const { username, email, role } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent admin from changing their own role
      if (userId === req.user._id.toString() && role && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot change your own role' });
      }

      if (username) user.username = username;
      if (email !== undefined) user.email = email;
      if (role) user.role = role;

      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Update user error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      res.status(500).json({ message: 'Server error during user update' });
    }
  }
);

// @route   GET /api/admin/submissions
// @desc    Get all submissions (with optional user filter)
// @access  Private/Admin
router.get('/submissions', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { user: userId } : {};
    
    const submissions = await Submission.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Handle deleted users by providing default values
    const submissionsWithUser = submissions.map(submission => ({
      ...submission,
      user: submission.user || {
        _id: null,
        username: '[Deleted User]',
        email: null,
      },
    }));
    
    res.json(submissionsWithUser);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/submissions/stats
// @desc    Get submission statistics
// @access  Private/Admin
router.get('/submissions/stats', async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();
    const submissionsByUser = await Submission.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          userId: '$_id',
          username: {
            $cond: {
              if: { $eq: [{ $size: '$user' }, 0] },
              then: '[Deleted User]',
              else: { $arrayElemAt: ['$user.username', 0] },
            },
          },
          email: {
            $cond: {
              if: { $eq: [{ $size: '$user' }, 0] },
              then: null,
              else: { $arrayElemAt: ['$user.email', 0] },
            },
          },
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      totalSubmissions,
      submissionsByUser,
    });
  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/submissions/export
// @desc    Export all submissions to Excel
// @access  Private/Admin
router.get('/submissions/export', async (req, res) => {
  try {
    // Fetch all submissions with user data
    const submissions = await Submission.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    // Map submissions to Excel format with specified headers
    const excelData = submissions.map(submission => {
      const user = submission.user || { username: '[Deleted User]' };
      const post = submission.postSubmission || {};

      return {
        'Sales Rep': user.username || '',
        'Customer Name': submission.customerName || '',
        'Origin City (First)': submission.shipper?.city || '',
        'Origin Province / State': submission.shipper?.stateOrProvince || '',
        'Destination City (Last)': submission.receiver?.city || '',
        'Destination Province/State': submission.receiver?.stateOrProvince || '',
        'Type of Service': submission.details?.serviceType || '',
        'LTL Spots': '', // Not available in current schema
        'Type of Travel': submission.details?.crossBorderStatus || '',
        'Net Cost (CAD)': post.netCostCAD || '',
        'Sell Rate to Customer (CAD)': post.sellRateCAD || '',
        'Margin (CAD)': post.marginCAD || '',
        'Won/Lost': post.wonLost || '',
        'Carrier Name': post.carrierName || '',
        'HL Load Number': post.hlLoadNumber || '',
        'Pricing Rep': post.pricingRep || '',
        'Day of Week': post.dayOfWeek || '',
        'Month': post.month || '',
        'Time Received': post.timeReceived || '',
        'Time Quoted': post.timeQuoted || '',
        'Total Time': post.totalTime || '',
        'Customer Feedback': post.customerFeedback || ''
      };
    });

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Sales Rep
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Origin City
      { wch: 20 }, // Origin Province/State
      { wch: 15 }, // Destination City
      { wch: 20 }, // Destination Province/State
      { wch: 15 }, // Type of Service
      { wch: 12 }, // LTL Spots
      { wch: 15 }, // Type of Travel
      { wch: 15 }, // Net Cost (CAD)
      { wch: 20 }, // Sell Rate to Customer (CAD)
      { wch: 15 }, // Margin (CAD)
      { wch: 12 }, // Won/Lost
      { wch: 20 }, // Carrier Name
      { wch: 18 }, // HL Load Number
      { wch: 15 }, // Pricing Rep
      { wch: 12 }, // Day of Week
      { wch: 12 }, // Month
      { wch: 15 }, // Time Received
      { wch: 15 }, // Time Quoted
      { wch: 12 }, // Total Time
      { wch: 30 }, // Customer Feedback
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    const fileName = `submissions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the buffer
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export submissions error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

export default router;

