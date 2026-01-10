import { useAuthStore } from '../store/useAuthStore';

function ChatPage() {
  const { logout } = useAuthStore();

  return (
    <div className="z-10">
      <h1>Chat</h1>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default ChatPage;
