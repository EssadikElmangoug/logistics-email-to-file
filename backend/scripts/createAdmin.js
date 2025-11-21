import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get admin credentials from command line arguments or use defaults
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    const email = process.argv[4] || 'admin@logistics.com';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      console.log(`❌ Admin user with username "${username}" already exists!`);
      console.log('   Use a different username or delete the existing admin first.');
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      username,
      password,
      email,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Username: ${admin.username}`);
    console.log(`Password: ${password}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please save these credentials securely!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdmin();

