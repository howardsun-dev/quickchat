import express from 'express';
import type { RequestHandler } from 'express';
import { login, logout, signup } from '../controllers/auth.controller.ts';

const router = express.Router();

router.post('/signup', signup as RequestHandler);

router.post('/login', login as RequestHandler);

router.post('/logout', logout as RequestHandler);

export default router;
