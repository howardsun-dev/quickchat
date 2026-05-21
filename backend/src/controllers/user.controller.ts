import User from '../models/User.ts';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

export const getUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(id).select(
      'fullName profilePic lastSeen'
    );

    res.json(user);
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
