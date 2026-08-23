import Link from "next/link";
import { Nav, Navbar, Offcanvas } from "react-bootstrap";
import {
  FaBookOpen,
  FaComments,
  FaHouse,
  FaRobot,
  FaRightToBracket,
  FaUser,
} from "react-icons/fa6";

import { NAV_ITEMS } from "../config";

const MOBILE_ICONS: Record<string, typeof FaHouse> = {
  "/": FaHouse,
  "/ai-review": FaRobot,
  "/qa": FaComments,
};

const SECONDARY_ITEMS = [
  { label: "Resources", href: "/qa/resources", icon: FaBookOpen },
];

type MobileNavProps = {
  pathname: string;
  isAuthenticated: boolean;
  isGuest?: boolean;
  /** Closes the drawer. Navigation itself is left to the Link. */
  onNavigate: () => void;
};

export default function MobileNav({
                                    pathname,
                                    isAuthenticated,
                                    isGuest = false,
                                    onNavigate,
                                  }: MobileNavProps) {
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${
      isActive(href) ? "bg-light text-primary fw-semibold" : "text-secondary"
    }`;

  const accountItem = isAuthenticated
    ? { label: "Account", href: "/account", icon: FaUser }
    : isGuest
      ? { label: "View Profile", href: "/account", icon: FaUser }
      : { label: "Sign In", href: "/auth/login", icon: FaRightToBracket };

  return (
    <Navbar.Offcanvas
      id="mobile-navbar-nav"
      aria-labelledby="mobile-navbar-label"
      placement="start"
      className="site-mobile-nav"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="mobile-navbar-label" className="fw-bold">
          LeaseQA
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = MOBILE_ICONS[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={linkClass(item.href)}
                onClick={onNavigate}
              >
                {Icon && <Icon size={18}/>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </Nav>
        <hr className="my-3"/>
        <Nav className="flex-column gap-2">
          {SECONDARY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={linkClass(item.href)}
              onClick={onNavigate}
            >
              <item.icon size={18}/>
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            href={accountItem.href}
            aria-current={isActive(accountItem.href) ? "page" : undefined}
            className={linkClass(accountItem.href)}
            onClick={onNavigate}
          >
            <accountItem.icon size={18}/>
            <span>{accountItem.label}</span>
          </Link>
        </Nav>
      </Offcanvas.Body>
    </Navbar.Offcanvas>
  );
}
