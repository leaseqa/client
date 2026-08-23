"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, signOut } from "@/app/store";
import { Container, Dropdown, Nav, Navbar, NavbarBrand, Stack, } from "react-bootstrap";
import AvatarToggle from "./HeaderBar/AvatarToggle";
import MobileNav from "./HeaderBar/MobileNav";
import ProfileHeader from "./HeaderBar/ProfileHeader";
import ProfileMenuItems from "./HeaderBar/ProfileMenuItems";
import type { NotificationMenuItem } from "./HeaderBar/NotificationsMenu";
import NotificationsMenu from "./HeaderBar/NotificationsMenu";
import { apiErrorMessage } from "@/app/lib/api/client";
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
  // The drawer has to be controlled from here. Left uncontrolled, navigating
  // from inside it never reset Navbar's expanded state, so the offcanvas stayed
  // open over the new page — and because it is aria-modal, its backdrop then
  // swallowed clicks on the toggle that would have closed it.
  const [navOpen, setNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<client.ActivityItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const initials = user?.name?.slice(0, 2).toUpperCase() || "?";

  const navigate = useCallback((href: string) => {
    setShowMenu(false);
    router.push(href);
  }, [router]);

  const handleSignOut = async () => {
    try {
      await client.logout();
    } finally {
      localStorage.removeItem("guest_session");
      dispatch(signOut());
      navigate("/");
    }
  };

  const loadNotifications = useCallback(async () => {
    if ( !isAuthenticated ) {
      setNotifications([]);
      setNotificationsError("");
      return;
    }
    try {
      setNotificationsLoading(true);
      setNotificationsError("");
      const items = await client.fetchNotifications();
      setNotifications(items);
    } catch ( error: unknown ) {
      setNotificationsError(
        apiErrorMessage(error, "Could not load notifications."),
      );
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  const handleSelectNotification = useCallback(
    async (item: NotificationMenuItem) => {
      try {
        await client.markNotificationsRead([item._id]);
        setNotifications((current) =>
          current.filter((notification) => notification._id !== item._id),
        );
      } catch {
        //TODO: this part is empty...?
      }
      if ( item.href ) {
        navigate(item.href);
      }
    },
    [navigate],
  );

  return (
    <header className="site-header">
      <Navbar expand={false} expanded={navOpen} onToggle={setNavOpen}>
        <Container fluid className="px-3">
          <div className="d-flex align-items-center gap-2">
            <Navbar.Toggle
              aria-controls="mobile-navbar-nav"
              aria-expanded={navOpen}
              aria-label={navOpen ? "Close navigation" : "Open navigation"}
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

          <MobileNav
            pathname={pathname}
            isAuthenticated={isAuthenticated}
            isGuest={isGuest}
            onNavigate={() => setNavOpen(false)}
          />

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
            <NotificationsMenu
              items={notifications}
              loading={notificationsLoading}
              error={notificationsError}
              onOpen={() => {
                void loadNotifications();
              }}
              onSelect={handleSelectNotification}
            />

            <span className="site-auth-divider" aria-hidden="true"/>

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
                <div className="profile-menu-list">
                  <ProfileMenuItems
                    isAuthenticated={isAuthenticated}
                    isGuest={isGuest}
                    navigate={navigate}
                    onSignOut={handleSignOut}
                  />
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </Stack>
        </Container>
      </Navbar>
    </header>
  );
}
