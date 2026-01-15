import bcrypt from 'bcryptjs';
import User, { type IUser } from '../models/User.ts';
import type { Request, Response } from 'express';
import { generateToken } from '../lib/utils.ts';
import {
  sendForgotPasswordEmail,
  sendWelcomeEmail,
} from '../emails/emailHandlers.ts';
import { ENV } from '../lib/env.ts';
import cloudinary from '../lib/cloudinary.ts';
import * as crypto from 'node:crypto';
import { json } from 'node:stream/consumers';

interface SignupBody {
  fullName: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const signup = async (
  req: Request<{}, {}, SignupBody>,
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

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
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

export const logout = async (_req: Request, res: Response) => {
  res.cookie('jwt', '', { maxAge: 0 });
  res.status(200).json({ message: 'Logout successfully' });
};

export const updateProfile = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: 'Profile pic is required' });

    const userId = (req.user as any)._id; // Fix with proper typing as needed

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('Error in update profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'If account exists, reset link has been sent',
      });
    }

    // Generate 1 hour token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${ENV.CLIENT_URL}/api/auth/forgot-password/${resetToken}`;

    try {
      await sendForgotPasswordEmail(user.fullName, user.email, resetUrl);
    } catch (error) {
      console.error(
        'Failed to send forgot password email: ',
        error,
        user.email
      );
    }

    res.status(200).json({
      message: 'If account exists, reset link has been sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetPasswordToken } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be 8+ characters' });
    }

    let user;

    if (resetPasswordToken) {
      user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
    } else {
      const userId = (req as any).user.id;
      user = await User.findById(userId);

      if (!user) res.status(404).json({ message: 'User not found' });

      //verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password incorrect' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    if (resetPasswordToken) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
    }

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
