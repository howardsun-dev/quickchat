import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatContainer from './ChatContainer';

const getMessages = vi.fn();
const subscribeToMessages = vi.fn();
const unsubscribeFromMessages = vi.fn();

vi.mock('../store/useChatStore', () => ({
  useChatStore: () => ({
    selectedUser: { _id: 'them', fullName: 'Howard', email: 'h@example.com', profilePic: '', lastSeen: null },
    getMessages,
    messages: [],
    isMessagesLoading: false,
    hasMoreMessages: false,
    currentPage: 1,
    typingUsers: { them: true },
    subscribeToMessages,
    unsubscribeFromMessages,
    getUserStatus: () => null,
  }),
}));

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: () => ({ authUser: { _id: 'me' }, onlineUsers: [] }),
}));

vi.mock('./ChatHeader', () => ({ default: () => <div>Chat header</div> }));
vi.mock('./MessageInput', () => ({ default: () => <div>Message input</div> }));
vi.mock('./MessagesLoadingSkeleton', () => ({ default: () => <div>Loading</div> }));

describe('ChatContainer typing indicator', () => {
  it('shows typing indicator when the selected user is typing', () => {
    render(<ChatContainer />);

    expect(screen.getByText('Howard is typing...')).toBeInTheDocument();
  });

  it('subscribes to messages on mount and unsubscribes on unmount', () => {
    const { unmount } = render(<ChatContainer />);

    expect(subscribeToMessages).toHaveBeenCalledOnce();

    unmount();
    expect(unsubscribeFromMessages).toHaveBeenCalledOnce();
  });
});
