import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import MessageInput from './MessageInput';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';

function ChatContainer() {
  const {
    messages,
    selectedUser,
    getMessages,
    isMessagesLoading,
    hasMoreMessages,
    currentPage,
    typingUsers,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // Load initial messages when user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id, { page: 1 });
      subscribeToMessages();
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id]);

  // Auto-scroll to bottom on new messages (but not on pagination load)
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const diff = messages.length - prevMessagesLengthRef.current;
      // Only auto-scroll if new message(s) were added at the bottom
      if (diff <= 2) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Infinite scroll: load older messages on scroll-to-top
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el || !hasMoreMessages || isMessagesLoading) return;

    if (el.scrollTop < 100) {
      const prevScrollHeight = el.scrollHeight;
      getMessages(selectedUser!._id, { page: currentPage + 1 }).then(() => {
        // Restore scroll position after prepending older messages
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop =
              scrollContainerRef.current.scrollHeight - prevScrollHeight;
          }
        });
      });
    }
  };

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id] ?? false;

  return (
    <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="relative">
          <img
            src={selectedUser.profilePic || '/avatar.png'}
            alt={selectedUser.fullName}
            className="size-10 rounded-full object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-slate-900 ${
              isOnline ? 'bg-green-500' : 'bg-slate-500'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-200 font-medium truncate">
            {selectedUser.fullName}
          </h3>
          <p className="text-xs text-slate-400">
            {isTyping
              ? 'Typing...'
              : isOnline
                ? 'Online'
                : useChatStore.getState().getUserStatus() || 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {/* Load more indicator */}
        {hasMoreMessages && (
          <div className="text-center py-2">
            <button
              onClick={() =>
                getMessages(selectedUser._id, { page: currentPage + 1 })
              }
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              disabled={isMessagesLoading}
            >
              {isMessagesLoading ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {isMessagesLoading && messages.length === 0 ? (
          <MessagesLoadingSkeleton />
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isUserMessage = msg.senderId === authUser?._id;
            const isOptimistic = msg.isOptimistic;

            return (
              <div
                key={msg._id}
                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isUserMessage
                        ? 'bg-cyan-600/80 text-white rounded-br-sm'
                        : 'bg-slate-700/50 text-slate-200 rounded-bl-sm'
                    } ${isOptimistic ? 'opacity-60' : ''}`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared image"
                        className="max-w-full rounded-lg mb-1"
                      />
                    )}
                    {msg.text && <p className="text-sm">{msg.text}</p>}
                  </div>
                  <p
                    className={`text-[10px] text-slate-500 mt-0.5 ${
                      isUserMessage ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isOptimistic && ' • Sending...'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator bubble */}
      {isTyping && (
        <div className="px-4 py-1">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse animation-delay-200">●</span>
            <span className="animate-pulse animation-delay-400">●</span>
            <span className="ml-1">{selectedUser.fullName} is typing...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
