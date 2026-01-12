import express from 'express';
import {
  getAlLContacts,
  getMessagesByUserId,
  sentMessage,
  getChatPartners,
} from '../controllers/message.controller.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';
import { arcjetProtection } from '../middleware/arcjet.middleware.ts';

const router = express.Router();
// middleware execute in order, so requests get rate-limited first then authenticated.
// more efficient since unauthenticated req get blocked by rate limiting before the auth middleware
router.use(arcjetProtection, protectRoute);

router.get('/contacts', getAlLContacts);
router.get('/chats', getChatPartners);
router.get('/:id', getMessagesByUserId);
router.post('/send/:id', sentMessage);

export default router;
