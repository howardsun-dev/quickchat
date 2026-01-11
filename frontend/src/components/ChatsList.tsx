import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLaoadingSkeleton';
import NoChatsFound from './NoChatsFound';
// import { useAuthStore } from '../store/useAuthStore';
import type { ChatPartner } from '../store/useChatStore';

/**
 * Render a list of chat partners with loading and empty states.
 *
 * Fetches chat partners on mount, shows a loading skeleton while partners are loading,
 * displays an empty-state component when there are no chats, and otherwise renders
 * clickable chat items that set the selected user when clicked.
 *
 * @returns A React element that is either the loading skeleton, the empty-state component, or the list of chat partner items.
 */
function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChatStore();
  // const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;
  return (
    <>
      {chats.map((chat: ChatPartner) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            {/* TODO: FIX ONLINE STATUS w/ SOCKETS */}
            <div className={'avatar online'}>
              <div className="size-12 rounded-full">
                <img
                  src={chat.profilePic || '/avatar.png'}
                  alt={chat.fullName}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {chat.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ChatsList;