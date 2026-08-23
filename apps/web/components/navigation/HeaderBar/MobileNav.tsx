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
  // Prefix match drives the *visual* state, so a /qa sub-page still highlights
  // "Ask" as the section you are in.
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // aria-current="page" must identify exactly one element. Prefix matching gave
  // both "Ask" and "Resources" the attribute on /qa/resources, so a screen
  // reader announced two current pages in one nav landmark. Only the exact
  // match makes the claim.
  const ariaCurrent = (href: string) =>
    pathname === href ? ("page" as const) : undefined;

  // Bootstrap's `text-primary` / `bg-light` utilities put a blue active row in a
  // warm olive product. Styling comes from `.site-mobile-nav-link` instead.
  const linkClass = (href: string) =>
    `site-mobile-nav-link${isActive(href) ? " is-active" : ""}`;

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
                aria-current={ariaCurrent(item.href)}
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
              aria-current={ariaCurrent(item.href)}
              className={linkClass(item.href)}
              onClick={onNavigate}
            >
              <item.icon size={18}/>
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            href={accountItem.href}
            aria-current={ariaCurrent(accountItem.href)}
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
