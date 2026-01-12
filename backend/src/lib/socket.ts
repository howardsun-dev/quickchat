import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from './env.ts';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.ts';
import User from '../models/User.ts';

const userSocketMap: Record<string, string> = {}; // #1 GLOBAL ONLY

// Extend Socket type with user fields you attach
interface AuthedSocket extends Socket {
  user?: typeof User.prototype;
  userId?: string;
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true,
  },
});

//Apply authentication to all socket connections
io.use(socketAuthMiddleware);

// Using this function to check if the user is online or not
export function getReceiverSocketId(
  userId: string | undefined
): string | undefined {
  if (!userId) return undefined;
  return userSocketMap[userId];
}

io.on('connection', (socket: AuthedSocket) => {
  if (!socket.user || !socket.userId) {
    console.log('Unauthenticated socket tried to connect');
    socket.disconnect(true);
    return;
  }

  // for storing online users
  console.log('A new client connected', socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id; // {userId: socketId}

  // send event to all connected clients about online users
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  //With socket.on you can listen to events from the client
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.user?.fullName);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };
