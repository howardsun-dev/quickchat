import { beforeEach, describe, expect, it, vi } from 'vitest';

const protectRoute = vi.fn((_req, _res, next) => next());
const arcjetProtection = vi.fn((_req, _res, next) => next());
const getAlLContacts = vi.fn((_req, res) => res.status(200).json({ route: 'contacts' }));
const getChatPartners = vi.fn((_req, res) => res.status(200).json({ route: 'chats' }));
const getMessagesByUserId = vi.fn((_req, res) => res.status(200).json({ route: 'messages' }));
const sentMessage = vi.fn((_req, res) => res.status(201).json({ route: 'send' }));

vi.mock('../src/middleware/auth.middleware.ts', () => ({ protectRoute }));
vi.mock('../src/middleware/arcjet.middleware.ts', () => ({ arcjetProtection }));
vi.mock('../src/controllers/message.controller.ts', () => ({
  getAlLContacts,
  getChatPartners,
  getMessagesByUserId,
  sentMessage,
}));

describe('messages routes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs arcjet and auth middleware before contact handlers', async () => {
    const express = (await import('express')).default;
    const request = (await import('supertest')).default;
    const router = (await import('../src/routes/messages.route.ts')).default;
    const app = express();
    app.use(express.json());
    app.use('/api/messages', router);

    const res = await request(app).get('/api/messages/contacts').expect(200);

    expect(res.body).toEqual({ route: 'contacts' });
    expect(arcjetProtection).toHaveBeenCalledOnce();
    expect(protectRoute).toHaveBeenCalledOnce();
    expect(getAlLContacts).toHaveBeenCalledOnce();
  });

  it('routes message sends to the send controller', async () => {
    const express = (await import('express')).default;
    const request = (await import('supertest')).default;
    const router = (await import('../src/routes/messages.route.ts')).default;
    const app = express();
    app.use(express.json());
    app.use('/api/messages', router);

    const res = await request(app)
      .post('/api/messages/send/507f1f77bcf86cd799439012')
      .send({ text: 'hello' })
      .expect(201);

    expect(res.body).toEqual({ route: 'send' });
    expect(sentMessage).toHaveBeenCalledOnce();
  });
});
