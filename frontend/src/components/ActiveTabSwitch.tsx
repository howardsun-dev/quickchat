import { useChatStore } from '../store/useChatStore';

/**
 * Renders a two-button tab switch that reads and updates the chat store's active tab.
 *
 * Shows "Chats" and "Contacts" buttons with conditional active styling; clicking a button sets the corresponding tab in the chat store.
 *
 * @returns The rendered tab switch element.
 */
function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();
  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab('chats')}
        className={`tab ${activeTab === 'chats' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}
      >
        Chats
      </button>
      <button
        onClick={() => setActiveTab('contacts')}
        className={`tab ${activeTab === 'contacts' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;