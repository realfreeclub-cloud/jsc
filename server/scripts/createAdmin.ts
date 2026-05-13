import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jsc_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const email = 'admin@jsc.com';
    const password = 'adminpassword123';
    
    const existingAdmin = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 12);
    
    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin password updated successfully!');
    } else {
      await User.create({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin created successfully!');
    }
    console.log('Email: ' + email);
    console.log('Password: ' + password);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
