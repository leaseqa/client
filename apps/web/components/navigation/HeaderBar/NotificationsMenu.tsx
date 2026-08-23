import React from "react";
import { Dropdown } from "react-bootstrap";
import { FaBell } from "react-icons/fa";

export type NotificationMenuItem = {
  _id: string;
  title: string;
  summary?: string;
  href?: string;
  createdAt: string;
};

type NotificationsMenuProps = {
  items: NotificationMenuItem[];
  loading: boolean;
  error: string;
  onOpen: () => void;
  onSelect: (item: NotificationMenuItem) => Promise<void> | void;
};

export function formatNotificationDate(
  value: string,
  now: Date = new Date(),
): string {
  const parsed = new Date(value);
  if ( Number.isNaN(parsed.getTime()) ) {
    return value;
  }
  const sameYear = parsed.getFullYear() === now.getFullYear();
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export default function NotificationsMenu({
                                            items,
                                            loading,
                                            error,
                                            onOpen,
                                            onSelect,
                                          }: NotificationsMenuProps) {
  const hasUnread = items.length > 0;

  return (
    <Dropdown align="end" onToggle={(nextShow) => nextShow && onOpen()}>
      <Dropdown.Toggle
        as="button"
        className="site-auth-trigger"
        aria-label="Open notifications"
      >
        <div
          className={`icon-circle icon-circle-md icon-bg-muted site-auth-chip site-auth-chip-bell ${
            hasUnread ? "has-unread" : ""
          }`}
        >
          <FaBell className="text-secondary" size={16}/>
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu className="notifications-menu">
        <div className="notifications-menu-head">
          <span className="notifications-menu-label">Notifications</span>
          {hasUnread ? (
            <span className="notifications-menu-count">{items.length} new</span>
          ) : null}
        </div>
        {loading ? (
          <div className="notifications-menu-state" aria-live="polite">
            <span className="notifications-menu-spinner" aria-hidden="true"/>
            Loading notifications…
          </div>
        ) : error ? (
          <div className="notifications-menu-state notifications-menu-state-error">
            <div className="notifications-menu-state-title">{error}</div>
            <div className="notifications-menu-state-hint">
              Check your connection and open this menu again.
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="notifications-menu-state">
            <div className="notifications-menu-state-title">
              No new notifications
            </div>
            <div className="notifications-menu-state-hint">
              New activity will appear here.
            </div>
          </div>
        ) : (
          <div className="notifications-menu-list">
            {items.map((item) => (
              <Dropdown.Item
                as="button"
                type="button"
                key={item._id}
                className="notifications-menu-item"
                onClick={() => {
                  void onSelect(item);
                }}
              >
                <span className="notifications-menu-dot" aria-hidden="true"/>
                <span className="notifications-menu-body">
                  <span className="notifications-menu-title">{item.title}</span>
                  {item.summary ? (
                    <span className="notifications-menu-summary">
                      {item.summary}
                    </span>
                  ) : null}
                  <span className="notifications-menu-date">
                    {formatNotificationDate(item.createdAt)}
                  </span>
                </span>
              </Dropdown.Item>
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
