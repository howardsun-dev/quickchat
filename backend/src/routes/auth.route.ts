import express from 'express';
import { login, signup } from '../controllers/auth.controller.ts';

const router = express.Router();

router.post('/signup', signup);

router.get('/login', login);

router.get('/logout', (req, res) => {
  res.send('Logout endpoint');
});

export default router;
