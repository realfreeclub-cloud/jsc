import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
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
      phone
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
