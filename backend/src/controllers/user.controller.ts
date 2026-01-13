import User from '../models/User.ts';
import type { Request, Response } from 'express';

export const getUserStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select(
      'fullName profilePic lastSeen'
    );

    res.json(user);
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
