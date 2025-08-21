const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Get all users
    const allUsers = await User.find({}).select('-password'); // Don't show passwords
    console.log(`Total users in database: ${allUsers.length}`);

    // Show each user
    allUsers.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Phone: ${user.phone || 'Not provided'}`);
      console.log(`  Address: ${user.address ? 'Provided' : 'Not provided'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Active: ${user.isActive}`);
    });

    // Count by role
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    const regularUsers = allUsers.filter(user => user.role === 'user');
    
    console.log(`\nUser Summary:`);
    console.log(`  Admin users: ${adminUsers.length}`);
    console.log(`  Regular users: ${regularUsers.length}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

checkUsers();
