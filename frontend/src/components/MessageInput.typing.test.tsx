import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MessageInput from './MessageInput';

const sendMessage = vi.fn();
const sendTyping = vi.fn();
const stopTyping = vi.fn();
let isSoundEnabled = false;
const playRandomKeyStrokeSound = vi.fn();

vi.mock('../store/useChatStore', () => ({
  useChatStore: () => ({ sendMessage, sendTyping, stopTyping, isSoundEnabled }),
}));

vi.mock('../hooks/useKeyboardSound', () => ({
  default: () => ({ playRandomKeyStrokeSound }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}));

describe('MessageInput typing events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSoundEnabled = false;
  });

  it('starts typing when text changes, stops when cleared, and stops after send', async () => {
    const user = userEvent.setup();
    render(<MessageInput />);
    const input = screen.getByPlaceholderText('Type your message...');

    await user.type(input, 'hi');
    expect(sendTyping).toHaveBeenCalled();

    await user.clear(input);
    expect(stopTyping).toHaveBeenCalled();

    await user.type(input, 'sent');
    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(stopTyping).toHaveBeenCalledTimes(2);
  });
});
