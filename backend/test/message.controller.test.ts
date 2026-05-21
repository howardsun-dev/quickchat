import { beforeEach, describe, expect, it, vi } from 'vitest';

const findByIdAndUpdate = vi.fn();
const findById = vi.fn();
const findOne = vi.fn();
const exists = vi.fn();
const messageSave = vi.fn();
const upload = vi.fn();
const to = vi.fn();
const getReceiverSocketIds = vi.fn();

vi.mock('../src/models/User.ts', () => ({
  default: { findByIdAndUpdate, findById, findOne, exists },
}));

vi.mock('../src/lib/cloudinary.ts', () => ({
  default: { uploader: { upload } },
}));

vi.mock('../src/lib/socket.ts', () => ({
  getReceiverSocketIds,
  io: { to },
}));

vi.mock('../src/models/Message.ts', () => ({
  default: vi.fn().mockImplementation(function (this: any, payload: any) {
    Object.assign(this, payload, {
      _id: 'message-1',
      save: messageSave,
    });
  }),
}));

const makeRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

const objectId = (value: string) => ({
  toString: () => value,
  equals: (other: string) => other === value,
});

describe('message controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    messageSave.mockResolvedValue(undefined);
    getReceiverSocketIds.mockReturnValue([]);
    to.mockReturnValue({ emit: vi.fn() });
  });

  it('rejects invalid receiver ids before querying the database', async () => {
    const { sentMessage } = await import('../src/controllers/message.controller.ts');
    const res = makeRes();

    await sentMessage(
      {
        body: { text: 'hello' },
        params: { id: 'not-an-object-id' },
        user: { _id: objectId('507f1f77bcf86cd799439011') },
      } as any,
      res as any
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid receiver id' });
    expect(exists).not.toHaveBeenCalled();
  });

  it('rejects messages with no text or image', async () => {
    const { sentMessage } = await import('../src/controllers/message.controller.ts');
    const res = makeRes();

    await sentMessage(
      {
        body: { text: '   ' },
        params: { id: '507f1f77bcf86cd799439012' },
        user: { _id: objectId('507f1f77bcf86cd799439011') },
      } as any,
      res as any
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Message must contain text or an image',
    });
  });

  it('trims text, saves the message, and emits to every receiver socket', async () => {
    const { sentMessage } = await import('../src/controllers/message.controller.ts');
    const res = makeRes();
    exists.mockResolvedValue({ _id: 'receiver' });
    getReceiverSocketIds.mockReturnValue(['socket-a', 'socket-b']);
    const emit = vi.fn();
    to.mockReturnValue({ emit });

    await sentMessage(
      {
        body: { text: '  hello  ' },
        params: { id: '507f1f77bcf86cd799439012' },
        user: { _id: objectId('507f1f77bcf86cd799439011') },
      } as any,
      res as any
    );

    expect(messageSave).toHaveBeenCalledOnce();
    expect(to).toHaveBeenCalledWith('socket-a');
    expect(to).toHaveBeenCalledWith('socket-b');
    expect(emit).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'hello', receiverId: '507f1f77bcf86cd799439012' })
    );
  });

  it('uploads image payloads before saving image messages', async () => {
    const { sentMessage } = await import('../src/controllers/message.controller.ts');
    const res = makeRes();
    exists.mockResolvedValue({ _id: 'receiver' });
    upload.mockResolvedValue({ secure_url: 'https://cdn.example/image.png' });

    await sentMessage(
      {
        body: { image: 'data:image/png;base64,abc' },
        params: { id: '507f1f77bcf86cd799439012' },
        user: { _id: objectId('507f1f77bcf86cd799439011') },
      } as any,
      res as any
    );

    expect(upload).toHaveBeenCalledWith('data:image/png;base64,abc');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ image: 'https://cdn.example/image.png' })
    );
  });
});
