const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const check = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const User = require('./models/User');
    const users = await User.find({}, 'name email role status');
    console.log('Current users in DB:', JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

check();
