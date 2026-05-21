import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatHeader from './ChatHeader';

const setSelectedUser = vi.fn();
let selectedUser: null | { _id: string; fullName: string; profilePic: string } = null;
let lastSeenDate: string | null = null;
let onlineUsers: string[] = [];

vi.mock('../store/useChatStore', () => ({
  useChatStore: () => ({ selectedUser, setSelectedUser, lastSeenDate }),
}));

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: () => ({ onlineUsers }),
}));

describe('ChatHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectedUser = { _id: 'user-1', fullName: 'Howard', profilePic: '' };
    lastSeenDate = 'Last seen 2 minutes ago';
    onlineUsers = [];
  });

  it('renders offline status with last seen fallback', () => {
    render(<ChatHeader />);

    expect(screen.getByText('Howard')).toBeInTheDocument();
    expect(screen.getByText('Last seen 2 minutes ago')).toBeInTheDocument();
  });

  it('renders online status when selected user is online', () => {
    onlineUsers = ['user-1'];

    render(<ChatHeader />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('clears selected user from the close button and Escape key', async () => {
    const user = userEvent.setup();
    render(<ChatHeader />);

    await user.click(screen.getByRole('button', { name: /close chat/i }));
    await user.keyboard('{Escape}');

    expect(setSelectedUser).toHaveBeenCalledWith(null);
    expect(setSelectedUser).toHaveBeenCalledTimes(2);
  });
});
