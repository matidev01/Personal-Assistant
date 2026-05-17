require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');

const seedDB = async () => {
  try {
    // 1. Connect to DB
    console.log('Connecting to database...');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');

    // 2. Clear DB collections
    console.log('Clearing database: deleting all Users and Accounts...');
    await User.deleteMany({});
    await Account.deleteMany({});
    console.log('All existing Users and Accounts deleted successfully!');

    // 3. Create default Super Admin
    const adminEmail = 'pervaizdev01@gmail.com';
    const adminPassword = '21421250@..';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const superAdmin = await User.create({
      firstName: 'Pervaiz',
      lastName: 'Dev',
      email: adminEmail,
      password: hashedPassword,
      phoneNumber: '03431157074',
      role: 'super-admin',
      isBlocked: false,
      isActive: true
    });

    console.log('\n==================================================');
    console.log('🎉 Default Super Admin created successfully!');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
