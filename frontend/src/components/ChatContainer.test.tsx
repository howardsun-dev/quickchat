import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatContainer from './ChatContainer';

const getMessagesByUserId = vi.fn();
const subscribeToMessages = vi.fn();
const unsubscribeFromMessages = vi.fn();
const subscribeToTyping = vi.fn();
const unsubscribeFromTyping = vi.fn();

vi.mock('../store/useChatStore', () => ({
  useChatStore: () => ({
    selectedUser: { _id: 'them', fullName: 'Howard', email: 'h@example.com', profilePic: '', lastSeen: null },
    getMessagesByUserId,
    messages: [],
    isMessagesLoading: false,
    typingUserId: 'them',
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
  }),
}));

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: () => ({ authUser: { _id: 'me' } }),
}));

vi.mock('./ChatHeader', () => ({ default: () => <div>Chat header</div> }));
vi.mock('./MessageInput', () => ({ default: () => <div>Message input</div> }));
vi.mock('./NoChatHistoryPlaceholder', () => ({ default: () => <div>No history</div> }));
vi.mock('./MessagesLoadingSkeleton', () => ({ default: () => <div>Loading</div> }));

describe('ChatContainer typing indicator', () => {
  it('subscribes to typing events and shows when the selected user is typing', () => {
    const { unmount } = render(<ChatContainer />);

    expect(subscribeToTyping).toHaveBeenCalledOnce();
    expect(screen.getByText('Howard is typing...')).toBeInTheDocument();

    unmount();
    expect(unsubscribeFromTyping).toHaveBeenCalledOnce();
  });
});
