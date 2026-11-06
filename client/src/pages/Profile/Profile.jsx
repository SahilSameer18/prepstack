import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getDiceBearAvatar } from "../../utils/avatar";
import ProfileHero from "./components/ProfileHero";
import IdentityCard from "./components/IdentityCard";
import SecurityCard from "./components/SecurityCard";
import SessionsCard from "./components/SessionsCard";
import SignOutCard from "./components/SignOutCard";
import DeleteAccountCard from "./components/DeleteAccountCard";

// The profile page: six independent cards. Only the identity form values live here, because the hero banner
// previews the avatar live while the user is still editing it.
const formFor = (user) => ({
  username: user?.username || "",
  avatar: user ? user.avatar || getDiceBearAvatar(user.username) : "",
});

const Profile = () => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState(() => formFor(user));

  // Reset the form whenever the user loads or changes (e.g. after saving). Done while rendering, which is React's
  // recommended way to reset state from a changing value: no extra effect pass, and no flash of stale values.
  const [syncedUser, setSyncedUser] = useState(user);
  if (user !== syncedUser) {
    setSyncedUser(user);
    if (user) setProfileForm(formFor(user));
  }

  if (!user) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

  const liveAvatarUrl = profileForm.avatar || user.avatar || getDiceBearAvatar(user.username);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 page-enter text-left">
      <div className="space-y-6">
        <ProfileHero user={user} avatarUrl={liveAvatarUrl} />
        <IdentityCard profileForm={profileForm} setProfileForm={setProfileForm} />
        <SecurityCard />
        <SessionsCard />
        <SignOutCard />
        <DeleteAccountCard />
      </div>
    </div>
  );
};

export default Profile;
