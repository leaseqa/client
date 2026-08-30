
import { RootState } from "@/app/store";
import { User } from "lucide-react";

type ProfileHeaderProps = {
  user: RootState["session"]["user"];
  initials: string;
  isAuthenticated: boolean;
  isGuest?: boolean;
};

export default function ProfileHeader({
                                        user,
                                        initials,
                                        isAuthenticated,
                                        isGuest = false,
                                      }: ProfileHeaderProps) {
  const hasUser = isAuthenticated || isGuest;

  if ( !hasUser ) {
    return (
      <div className="profile-menu-identity">
        <span
          className="profile-menu-avatar profile-menu-avatar-anon"
          aria-hidden="true"
        >
          <User size={14}/>
        </span>
        <div className="profile-menu-copy">
          <div className="profile-menu-name">Not signed in</div>
          <div className="profile-menu-hint">Sign in to access more</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-menu-identity">
      <span className="profile-menu-avatar" aria-hidden="true">
        {initials}
      </span>
      <div className="profile-menu-copy">
        <div className="profile-menu-name">{user?.name || "Account"}</div>
      </div>
    </div>
  );
}
