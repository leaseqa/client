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

const formatTime = (value: string) => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

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
      <Dropdown.Menu style={{ minWidth: 280 }}>
        <div className="px-3 py-2 fw-semibold">Notifications</div>
        <Dropdown.Divider/>
        {loading ? (
          <div className="px-3 py-2 text-secondary small">Loading...</div>
        ) : error ? (
          <div className="px-3 py-2 text-danger small">{error}</div>
        ) : items.length === 0 ? (
          <div className="px-3 py-2 text-secondary small">
            No new notifications
          </div>
        ) : (
          items.map((item) => (
            <Dropdown.Item
              key={item._id}
              onClick={() => {
                void onSelect(item);
              }}
            >
              <div className="fw-semibold small">{item.title}</div>
              {item.summary ? (
                <div className="text-secondary small">{item.summary}</div>
              ) : null}
              <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
                {formatTime(item.createdAt)}
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
