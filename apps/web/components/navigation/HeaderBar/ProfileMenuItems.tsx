import { Dropdown } from "react-bootstrap";

type ProfileMenuItemsProps = {
  isAuthenticated: boolean;
  isGuest?: boolean;
  navigate: (href: string) => void;
  onSignOut: () => void;
};

export default function ProfileMenuItems({
                                           isAuthenticated,
                                           isGuest = false,
                                           navigate,
                                           onSignOut
                                         }: ProfileMenuItemsProps) {
  if ( !isAuthenticated && !isGuest ) {
    return (
      <>
        <Dropdown.Item
          as="button"
          type="button"
          className="profile-menu-item"
          onClick={() => navigate("/auth/login")}
        >
          Sign in
        </Dropdown.Item>
        <Dropdown.Item
          as="button"
          type="button"
          className="profile-menu-item"
          onClick={() => navigate("/auth/register")}
        >
          Create account
        </Dropdown.Item>
      </>
    );
  }

  if ( isGuest ) {
    return (
      <>
        <Dropdown.Item
          as="button"
          type="button"
          className="profile-menu-item"
          onClick={() => navigate("/account")}
        >
          View profile
        </Dropdown.Item>
        <Dropdown.Divider className="profile-menu-separator"/>
        <Dropdown.Item
          as="button"
          type="button"
          className="profile-menu-item"
          onClick={() => navigate("/auth/login")}
        >
          Sign in for full access
        </Dropdown.Item>
        <Dropdown.Item
          as="button"
          type="button"
          className="profile-menu-item"
          onClick={() => navigate("/auth/register")}
        >
          Create account
        </Dropdown.Item>
      </>
    );
  }

  return (
    <>
      <Dropdown.Item
        as="button"
        type="button"
        className="profile-menu-item"
        onClick={() => navigate("/account")}
      >
        Go to Account
      </Dropdown.Item>
      <Dropdown.Divider className="profile-menu-separator"/>
      <Dropdown.Item
        as="button"
        type="button"
        className="profile-menu-item profile-menu-item-warm"
        onClick={onSignOut}
      >
        Sign Out
      </Dropdown.Item>
    </>
  );
}
