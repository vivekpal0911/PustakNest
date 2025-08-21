const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@bookstore.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('Name:', adminUser.name);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Is Active:', adminUser.isActive);
    
    // Test password
    const testPassword = 'Admin123!';
    const isPasswordValid = await adminUser.comparePassword(testPassword);
    
    console.log('\n🔐 Password Test:');
    console.log('Test Password:', testPassword);
    console.log('Password Valid:', isPasswordValid ? '✅ YES' : '❌ NO');
    
    if (!isPasswordValid) {
      console.log('\n⚠️  Password mismatch! Let\'s fix this...');
      
      // Update password
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('✅ Password updated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkAdminUser();




