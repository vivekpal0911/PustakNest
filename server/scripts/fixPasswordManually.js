const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function fixPasswordManually() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@bookstore.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found, fixing password manually...');
    
    // Manually hash password and update
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    // Update password directly in database
    await User.updateOne(
      { email: 'admin@bookstore.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('✅ Password updated manually!');
    
    // Verify the fix
    const updatedAdmin = await User.findOne({ email: 'admin@bookstore.com' });
    const isPasswordValid = await updatedAdmin.comparePassword('Admin123!');
    
    console.log('\n🔍 Final Verification:');
    console.log('Password field exists:', !!updatedAdmin.password);
    console.log('Password test result:', isPasswordValid ? '✅ VALID' : '❌ INVALID');
    
    if (isPasswordValid) {
      console.log('\n🎉 SUCCESS! Admin login should work now!');
      console.log('\n🔐 Admin Login Credentials:');
      console.log('Email: admin@bookstore.com');
      console.log('Password: Admin123!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixPasswordManually();




