import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getDiceBearAvatar } from "../../utils/avatar";
import ProfileHero from "./components/ProfileHero";
import IdentityCard from "./components/IdentityCard";
import SecurityCard from "./components/SecurityCard";
import SessionsCard from "./components/SessionsCard";
import SignOutCard from "./components/SignOutCard";
import DeleteAccountCard from "./components/DeleteAccountCard";
import PageLoader from "../../components/ui/PageLoader";
import PageBackdrop from "../../components/ui/PageBackdrop";

// The profile page: a header, then one section at a time (a side list on wide screens, a row of tabs on phones).
// Only the identity form values live here, because the header previews the avatar live while the user is still editing it.
const formFor = (user) => ({
  username: user?.username || "",
  avatar: user ? user.avatar || getDiceBearAvatar(user.username) : "",
});

const TABS = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "devices", label: "Devices" },
  { id: "danger", label: "Sign out" },
];

const Profile = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("account");

  const [profileForm, setProfileForm] = useState(() => formFor(user));

  // Reset the form whenever the user loads or changes (e.g. after saving). Done while rendering, which is React's
  // recommended way to reset state from a changing value: no extra effect pass, and no flash of stale values.
  const [syncedUser, setSyncedUser] = useState(user);
  if (user !== syncedUser) {
    setSyncedUser(user);
    if (user) setProfileForm(formFor(user));
  }

  if (!user) return <PageLoader message="Loading profile..." />;

  const liveAvatarUrl = profileForm.avatar || user.avatar || getDiceBearAvatar(user.username);

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 text-left sm:px-6">
        <ProfileHero user={user} avatarUrl={liveAvatarUrl} />

        <div className="mt-8 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
          <nav aria-label="Profile sections" className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:sticky lg:top-24 lg:mb-0 lg:self-start lg:overflow-visible">
            <ul className="grid grid-cols-2 gap-1.5 sm:flex lg:flex-col lg:gap-0 lg:border-l lg:border-ink/[0.12]">
              {TABS.map(({ id, label }) => {
                const active = tab === id;
                return (
                  <li key={id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setTab(id)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-[44px] w-full cursor-pointer items-center whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left font-ui text-sm transition-colors lg:-ml-px lg:rounded-none lg:border-l-2 lg:px-4 ${
                        active ? "border-ink/[0.2] bg-brand/12 font-semibold text-brand lg:border-brand lg:bg-transparent" : "border-ink/[0.15] text-muted hover:text-fg lg:border-transparent"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Every section stays mounted (just hidden) so a half-typed password or a device list is not lost when switching */}
          <div className="min-w-0">
            <section hidden={tab !== "account"} aria-label="Account" className="page-enter">
              <IdentityCard profileForm={profileForm} setProfileForm={setProfileForm} />
            </section>
            <section hidden={tab !== "security"} aria-label="Security" className="page-enter">
              <SecurityCard />
            </section>
            <section hidden={tab !== "devices"} aria-label="Devices" className="page-enter">
              <SessionsCard />
            </section>
            <section hidden={tab !== "danger"} aria-label="Sign out and delete account" className="page-enter space-y-5">
              <SignOutCard />
              <DeleteAccountCard />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
