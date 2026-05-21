import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.ts';
import messageRoutes from './routes/messages.route.ts';
import userRoutes from './routes/users.route.ts';
import path from 'node:path';
import { connectDB } from './lib/db.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ENV } from './lib/env.ts';
import { app, server } from './lib/socket.ts';

dotenv.config();

const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10MB' })); // req.body parse json
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser()); // parses cookies

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);

// Make ready for deployment
if (process.env.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  }
}

startServer();
