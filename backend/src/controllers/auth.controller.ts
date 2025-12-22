import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.ts';
import type { Request, Response } from 'express';
import { generateToken } from '../lib/utils.ts';

interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export const signup = async (
  req: Request<{}, {}, SignupRequest>,
  res: Response
): Promise<void> => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id.toString(), res);

      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      // TODO: Send a welcome email to user
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: unknown) {
    console.log('Error in sign up controller', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
