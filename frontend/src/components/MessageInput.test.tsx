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

describe('MessageInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSoundEnabled = false;
  });

  it('disables submit until text or an image is present', () => {
    render(<MessageInput />);

    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('sends trimmed text and clears the textbox', async () => {
    const user = userEvent.setup();
    render(<MessageInput />);

    await user.type(screen.getByPlaceholderText('Type your message...'), ' hello ');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(sendMessage).toHaveBeenCalledWith({ text: 'hello', image: null });
    expect(screen.getByPlaceholderText('Type your message...')).toHaveValue('');
  });

  it('plays keyboard sounds when sound is enabled', async () => {
    isSoundEnabled = true;
    const user = userEvent.setup();
    render(<MessageInput />);

    await user.type(screen.getByPlaceholderText('Type your message...'), 'a');

    expect(playRandomKeyStrokeSound).toHaveBeenCalled();
  });
});
