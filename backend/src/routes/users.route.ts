import express from 'express';
import { arcjetProtection } from '../middleware/arcjet.middleware.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';
import { getUserStatus } from '../controllers/user.controller.ts';

const router = express();
// router.use(arcjetProtection, protectRoute);

router.get('/status/:id', getUserStatus);

export default router;
