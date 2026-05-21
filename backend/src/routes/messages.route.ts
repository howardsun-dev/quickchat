import express from 'express';
import {
  getAllContacts,
  getMessagesByUserId,
  sentMessage,
  getChatPartners,
} from '../controllers/message.controller.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';
import { arcjetProtection } from '../middleware/arcjet.middleware.ts';

const router = express.Router();
router.use(arcjetProtection, protectRoute);

router.get('/contacts', getAllContacts);
router.get('/chats', getChatPartners);
router.get('/:id', getMessagesByUserId);
router.post('/send/:id', sentMessage);

export default router;
