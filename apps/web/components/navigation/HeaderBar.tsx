"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, signOut } from "@/app/store";
import {
  Container,
  Dropdown,
  Nav,
  Navbar,
  NavbarBrand,
  Stack,
} from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import AvatarToggle from "./HeaderBar/AvatarToggle";
import MobileNav from "./HeaderBar/MobileNav";
import ProfileHeader from "./HeaderBar/ProfileHeader";
import ProfileMenuItems from "./HeaderBar/ProfileMenuItems";
import * as client from "@/app/account/client";
import { NAV_ITEMS } from "./config";

export default function HeaderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const session = useSelector((state: RootState) => state.session);
  const user = session.user;
  const isAuthenticated = session.status === "authenticated" && !!user;
  const isGuest = session.status === "guest";

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications: { id: string; title: string; href?: string }[] = [];
  const initials = user?.name?.slice(0, 2).toUpperCase() || "?";

  const navigate = (href: string) => {
    setShowMenu(false);
    router.push(href);
  };

  const handleSignOut = async () => {
    try {
      await client.logout();
    } finally {
      localStorage.removeItem("guest_session");
      dispatch(signOut());
      navigate("/");
    }
  };

  return (
    <header className="site-header">
      <Navbar expand={false}>
        <Container fluid className="px-3">
          <div className="d-flex align-items-center gap-2">
            <Navbar.Toggle
              aria-controls="mobile-navbar-nav"
              className="d-lg-none border-0 p-0 me-2"
            />
            <NavbarBrand
              as={Link}
              href="/"
              className="site-brand me-0 text-decoration-none"
            >
              <span className="site-brand-copy">
                <span className="site-wordmark">
                  <span className="site-wordmark-main">Lease</span>
                  <span className="site-wordmark-accent">QA</span>
                </span>
              </span>
            </NavbarBrand>
          </div>

          <MobileNav pathname={pathname} />

          <Nav className="site-nav">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`site-nav-link ${isActive ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </Nav>

          <Stack direction="horizontal" gap={2} className="site-auth">
            <Dropdown
              align="end"
              show={showNotifications}
              onToggle={setShowNotifications}
            >
              <Dropdown.Toggle
                as="button"
                className="site-auth-trigger"
                aria-label="Open notifications"
              >
                <div className="icon-circle icon-circle-md icon-bg-muted site-auth-chip site-auth-chip-bell">
                  <FaBell className="text-secondary" size={16} />
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: 240 }}>
                <div className="px-3 py-2 fw-semibold">Notifications</div>
                <Dropdown.Divider />
                {notifications.length === 0 ? (
                  <div className="px-3 py-2 text-secondary small">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Dropdown.Item
                      key={item.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (item.href) {
                          navigate(item.href);
                        }
                      }}
                    >
                      {item.title}
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown align="end" show={showMenu} onToggle={setShowMenu}>
              <Dropdown.Toggle
                as={AvatarToggle}
                initials={initials}
                isAuthenticated={isAuthenticated}
                isGuest={isGuest}
              />
              <Dropdown.Menu className="profile-menu">
                <ProfileHeader
                  user={user}
                  initials={initials}
                  isAuthenticated={isAuthenticated}
                  isGuest={isGuest}
                />
                <Dropdown.Divider />
                <ProfileMenuItems
                  isAuthenticated={isAuthenticated}
                  isGuest={isGuest}
                  navigate={navigate}
                  onSignOut={handleSignOut}
                />
              </Dropdown.Menu>
            </Dropdown>
          </Stack>
        </Container>
      </Navbar>
    </header>
  );
}
