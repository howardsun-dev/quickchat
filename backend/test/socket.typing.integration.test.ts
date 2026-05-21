import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { io as createClient, Socket as ClientSocket } from 'socket.io-client';
import type { AddressInfo } from 'net';

const findByIdAndUpdate = vi.fn();

vi.mock('../src/models/User.ts', () => ({
  default: {
    prototype: {},
    findByIdAndUpdate,
  },
}));

vi.mock('../src/middleware/socket.auth.middleware.ts', () => ({
  socketAuthMiddleware: (socket: { handshake: { auth?: { userId?: string } }; user?: { fullName: string }; userId?: string }, next: () => void) => {
    const userId = socket.handshake.auth?.userId ?? 'test-user';
    socket.userId = userId;
    socket.user = { fullName: userId };
    next();
  },
}));

const waitForEvent = <T>(socket: ClientSocket, event: string) =>
  new Promise<T>((resolve) => socket.once(event, resolve));

describe('socket typing events', () => {
  let serverModule: typeof import('../src/lib/socket.ts');
  let baseUrl: string;
  let clients: ClientSocket[];
  let consoleLog: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    serverModule = await import('../src/lib/socket.ts');
    await new Promise<void>((resolve) => serverModule.server.listen(0, resolve));
    const address = serverModule.server.address() as AddressInfo;
    baseUrl = `http://localhost:${address.port}`;
    clients = [];
  });

  afterEach(async () => {
    clients.forEach((client) => client.disconnect());
    await new Promise<void>((resolve) => serverModule.io.close(() => resolve()));
    if (serverModule.server.listening) {
      await new Promise<void>((resolve) => serverModule.server.close(() => resolve()));
    }
    consoleLog.mockRestore();
  });

  const connectUser = async (userId: string) => {
    const client = createClient(baseUrl, {
      auth: { userId },
      transports: ['websocket'],
      forceNew: true,
    });
    clients.push(client);
    await waitForEvent(client, 'connect');
    return client;
  };

  it('forwards typing start and stop events only to the selected receiver', async () => {
    const sender = await connectUser('sender');
    const receiver = await connectUser('receiver');
    const unrelated = await connectUser('unrelated');
    const unrelatedHandler = vi.fn();
    unrelated.on('typing:start', unrelatedHandler);

    const receiverStarted = waitForEvent<{ senderId: string }>(receiver, 'typing:start');
    sender.emit('typing:start', { receiverId: 'receiver' });
    await expect(receiverStarted).resolves.toEqual({ senderId: 'sender' });
    expect(unrelatedHandler).not.toHaveBeenCalled();

    const receiverStopped = waitForEvent<{ senderId: string }>(receiver, 'typing:stop');
    sender.emit('typing:stop', { receiverId: 'receiver' });
    await expect(receiverStopped).resolves.toEqual({ senderId: 'sender' });
  });
});
