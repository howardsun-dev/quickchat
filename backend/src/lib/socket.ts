import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from './env.ts';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.ts';
import User from '../models/User.ts';

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
export function getReceiverSocketIds(userId: string | undefined): string[] {
  if (!userId) return [];
  return Array.from(userSocketMap[userId] ?? []);
}

const userSocketMap: Record<string, Set<string>> = {}; // userId -> active socket ids

const getOnlineUserIds = () => Object.keys(userSocketMap);

io.on('connection', (socket: AuthedSocket) => {
  if (!socket.user || !socket.userId) {
    console.log('Unauthenticated socket tried to connect');
    socket.disconnect(true);
    return;
  }

  // for storing online users
  console.log('A new client connected', socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] ??= new Set<string>();
  userSocketMap[userId].add(socket.id);

  // send event to all connected clients about online users
  io.emit('getOnlineUsers', getOnlineUserIds());

  socket.on('typing:start', ({ receiverId }: { receiverId?: string }) => {
    getReceiverSocketIds(receiverId).forEach((socketId) => {
      io.to(socketId).emit('typing:start', { senderId: userId });
    });
  });

  socket.on('typing:stop', ({ receiverId }: { receiverId?: string }) => {
    getReceiverSocketIds(receiverId).forEach((socketId) => {
      io.to(socketId).emit('typing:stop', { senderId: userId });
    });
  });

  //With socket.on you can listen to events from the client
  socket.on('disconnect', async () => {
    Object.keys(userSocketMap).forEach((receiverId) => {
      if (receiverId === userId) return;
      getReceiverSocketIds(receiverId).forEach((socketId) => {
        io.to(socketId).emit('typing:stop', { senderId: userId });
      });
    });

    console.log('Client disconnected', socket.user?.fullName);

    userSocketMap[userId]?.delete(socket.id);
    const isUserOffline = !userSocketMap[userId]?.size;
    if (isUserOffline) {
      delete userSocketMap[userId];

      // Implement lastSeen only after the user's final socket disconnects.
      try {
        await User.findByIdAndUpdate(socket.userId, {
          lastSeen: new Date(),
        });
      } catch (error) {
        console.error('Unable to update online status');
      }
    }

    io.emit('getOnlineUsers', getOnlineUserIds());
  });
});

export { io, app, server };
