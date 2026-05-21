import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import NoConversationPlaceholder from './NoConversationPlaceholder';
import PageLoader from './PageLoader';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';

describe('placeholder and loading components', () => {
  it('renders the no-chat-history prompt with the selected user name', () => {
    render(<NoChatHistoryPlaceholder name="Howard" />);

    expect(screen.getByText('Start your conversation with Howard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /say hello/i })).toBeInTheDocument();
  });

  it('renders the no-conversation placeholder', () => {
    render(<NoConversationPlaceholder />);

    expect(screen.getByText('Select a conversation')).toBeInTheDocument();
  });

  it('renders loader and skeleton placeholders without crashing', () => {
    const { container: loader } = render(<PageLoader />);
    expect(loader.querySelector('.animate-spin')).toBeInTheDocument();

    const { container: users } = render(<UsersLoadingSkeleton />);
    expect(users.querySelectorAll('.animate-pulse')).toHaveLength(3);

    const { container: messages } = render(<MessagesLoadingSkeleton />);
    expect(messages.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });
});
