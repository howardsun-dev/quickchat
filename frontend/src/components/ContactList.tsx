import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import type { BaseUser } from '../store/useChatStore';

function ContactList() {
  const { getAllContacts, allContacts, isUsersLoading, setSelectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="space-y-2" role="list" aria-label="Contact list">
      {allContacts.map((contact: BaseUser) => (
        <div
          key={contact._id}
          tabIndex={0}
          role="listitem"
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          onClick={() => setSelectedUser(contact)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedUser(contact);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(contact._id) ? 'online' : 'offline'}`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={contact.profilePic || '/avatar.png'}
                  alt={`${contact.fullName}'s avatar`}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {contact.fullName}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;