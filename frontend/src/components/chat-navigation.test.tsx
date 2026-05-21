import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActiveTabSwitch from './ActiveTabSwitch';
import NoChatsFound from './NoChatsFound';

const setActiveTab = vi.fn();
let activeTab: 'chats' | 'contacts' = 'chats';

vi.mock('../store/useChatStore', () => ({
  useChatStore: () => ({ activeTab, setActiveTab }),
}));

describe('chat navigation components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeTab = 'chats';
  });

  it('switches to contacts when the Contacts tab is clicked', async () => {
    const user = userEvent.setup();
    render(<ActiveTabSwitch />);

    await user.click(screen.getByRole('button', { name: 'Contacts' }));

    expect(setActiveTab).toHaveBeenCalledWith('contacts');
  });

  it('switches empty chat users to contacts from the empty state', async () => {
    const user = userEvent.setup();
    render(<NoChatsFound />);

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Find contacts' }));

    expect(setActiveTab).toHaveBeenCalledWith('contacts');
  });
});
