import { Socket } from 'socket.io';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '../models/User.ts';
import { ENV } from '../lib/env.ts';

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

// Extend Socket type with user fields you attach
interface AuthedSocket extends Socket {
  user?: typeof User.prototype;
  userId?: string;
}

export const socketAuthMiddleware = async (
  socket: AuthedSocket,
  next: (err?: Error) => void
) => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split('; ')
      .find((row: string) => row.startsWith('jwt='))
      ?.split('=')[1];

    if (!token) {
      console.log('Socket connection rejected: No token provided');
      return next(new Error('Unauthorized - No Token Provided'));
    }

    // verify the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
    if (!decoded) {
      console.log('Socket connection rejected: Invalid token');
      return next(new Error('Unauthorized - Invalid Token'));
    }

    // find the user from db
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('Socket connection rejected: User not found');
      return next(new Error('User not found'));
    }

    // attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(
      `Socket authenticated for user: ${user.fullName} (${user._id})`
    );

    next();
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : 'Authentication failed';
    console.log('Error in socket authentication:', errMessage);
    next(new Error('Unauthorized - Authentication failed'));
  }
};
