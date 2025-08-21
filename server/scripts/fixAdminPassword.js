const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function fixAdminPassword() {
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
      console.log('❌ Admin user not found! Creating new admin user...');
      
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
        }
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('✅ Admin user found, fixing password...');
      
      // Fix password
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('✅ Admin password fixed successfully!');
    }
    
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

fixAdminPassword();




