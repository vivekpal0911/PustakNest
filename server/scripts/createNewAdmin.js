const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createNewAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Remove old admin user completely
    await User.deleteOne({ email: 'admin@bookstore.com' });
    console.log('✅ Old admin user removed');
    
    // Create fresh admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const newAdmin = new User({
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'United States'
      },
      isActive: true
    });
    
    await newAdmin.save();
    console.log('✅ New admin user created successfully!');
    
    // Verify the new admin user
    const verifyAdmin = await User.findOne({ email: 'admin@bookstore.com' });
    console.log('\n🔍 Verification:');
    console.log('Name:', verifyAdmin.name);
    console.log('Email:', verifyAdmin.email);
    console.log('Role:', verifyAdmin.role);
    console.log('Password field exists:', !!verifyAdmin.password);
    console.log('Is Active:', verifyAdmin.isActive);
    
    // Test password
    const isPasswordValid = await verifyAdmin.comparePassword('Admin123!');
    console.log('Password test result:', isPasswordValid ? '✅ VALID' : '❌ INVALID');
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email: admin@bookstore.com');
    console.log('Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createNewAdmin();




