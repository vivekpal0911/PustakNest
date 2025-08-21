const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@bookstore.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Name:', existingAdmin.name);
      
      // Update password if needed
      const newPassword = 'Admin123!';
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await User.updateOne(
        { email: 'admin@bookstore.com' },
        { password: hashedPassword }
      );
      
      console.log('✅ Admin password updated successfully!');
      console.log('New password:', newPassword);
    } else {
      // Create new admin user
      const adminPassword = 'Admin123!';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@bookstore.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: {
          street: 'Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          zipCode: '12345',
          country: 'Admin Country'
        },
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@bookstore.com');
      console.log('Password:', adminPassword);
      console.log('Role: admin');
    }

    // Verify admin user
    const admin = await User.findOne({ email: 'admin@bookstore.com' });
    console.log('\nAdmin user details:');
    console.log('ID:', admin._id);
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Active:', admin.isActive);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

createAdminUser();


