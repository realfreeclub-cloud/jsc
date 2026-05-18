import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Student from '../models/Student';
import bcrypt from 'bcryptjs';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '90d'
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'student'
    });

    // Automatically create a corresponding Student document
    // so they are linked and show up in the Admin Panel "Students" section
    await Student.create({
      name,
      email,
      phone: phone || `999${Math.floor(1000000 + Math.random() * 9000000)}`, // guarantee a valid phone number
      course: 'Not Enrolled',
      status: 'active',
      isActive: true
    }).catch(err => {
      console.warn('Matching Student creation warning:', err.message);
    });

    const token = signToken(newUser._id.toString());

    const userToReturn = newUser.toObject();
    delete (userToReturn as any).password;

    res.status(201).json({
      status: 'success',
      token,
      data: userToReturn
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  console.log('--- LOGIN REQUEST RECEIVED ---');
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });
    }

    const user: any = await User.findOne({ email });
    console.log('Login attempt:', email);
    if (user) {
      console.log('User found:', user.email, 'Role:', user.role);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      if (!isMatch) {
        return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
      }
    } else {
      console.log('User NOT found');
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    const token = signToken(user._id.toString());

    const userToReturn = user.toObject();
    delete (userToReturn as any).password;

    res.status(200).json({
      status: 'success',
      token,
      data: userToReturn
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'fail', message: 'Please provide current and new passwords!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password successfully updated!'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};
