import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.ts';
import messageRoutes from './routes/messages.route.ts';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => console.log('Server is running at port: ' + PORT));
