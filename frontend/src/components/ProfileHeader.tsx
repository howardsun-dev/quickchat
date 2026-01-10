import { useAuthStore } from '../store/useAuthStore';

function ProfileHeader() {
  const { logout } = useAuthStore();

  return (
    <div className="z-10">
      Profile Header
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default ProfileHeader;
