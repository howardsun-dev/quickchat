import jwt from 'jsonwebtoken';
import type { Response } from 'express';

export const generateToken = (userId: string, res: Response): String => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set');
  }
  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, //ms
    httpOnly: true, // prevent XSS attack
    sameSite: 'strict', // CSRF Attacks
    secure: process.env.NODE_ENV == 'development' ? false : true,
  });

  return token;
};
