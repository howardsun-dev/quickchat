import bcrypt from 'bcryptjs';
import User from '../models/User.ts';
import type { Request, Response } from 'express';
import { generateToken } from '../lib/utils.ts';
import { sendWelcomeEmail } from '../emails/emailHandlers.ts';
import { ENV } from '../lib/env.ts';

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
      const savedUser = await newUser.save();
      generateToken(savedUser._id.toString(), res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIENT_URL
        );
      } catch (error) {
        console.error('Failed to send welcome email: ', error);
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: unknown) {
    console.log('Error in sign up controller', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (
  req: { body: { email: any; password: any } },
  res: Response<any, Record<string, any>>
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    generateToken(user._id.toString(), res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error('Error in login controller', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (
  _: any,
  res: Response<any, Record<string, any>>
) => {
  res.cookie('jwt', '', { maxAge: 0 });
  res.status(200).json({ message: 'Logout successfully' });
};
