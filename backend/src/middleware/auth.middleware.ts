import jwt from 'jsonwebtoken';
import User from '../models/User.ts';
import { ENV } from '../lib/env.ts';
import { Document } from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: Document & {
        email: string;
        fullName: string;
        password?: string;
        profilePic: string;
      };
    }
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;

    if (!token)
      return res.status(401).json({ message: 'Unauthorized - no Token' });

    if (!ENV.JWT_SECRET)
      return res.status(500).json({ message: 'Internal server error' });

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;

    next();
  } catch (error) {
    console.log('Error in protectRoute middleware', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
