"use client";

import { useEffect } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

export type ToastType = "success" | "error";

export type ToastData = {
  show: boolean;
  message: string;
  type: ToastType;
};

type ToastNotificationProps = {
  toast: ToastData;
  onClose: () => void;
};

const config = {
  success: {
    icon: <CircleCheck size={20} aria-hidden="true"/>,
    title: "Success"
  },
  error: {
    icon: <CircleAlert size={20} aria-hidden="true"/>,
    title: "Error"
  }
};

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if ( toast.show ) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, onClose]);

  if ( !toast.show ) return null;

  const { icon, title } = config[toast.type];

  // Announced: an error interrupts, a confirmation waits its turn. The toast
  // used to be silent to screen readers, and its close button had no name.
  return (
    <div className="toast-wrapper">
      <div
        className={`toast-panel toast-panel-${toast.type}`}
        role={toast.type === "error" ? "alert" : "status"}
      >
        <div className="toast-panel-icon">{icon}</div>
        <div className="toast-panel-copy">
          <div className="toast-panel-title">{title}</div>
          <div className="toast-panel-message">{toast.message}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="toast-panel-close"
          aria-label="Dismiss notification"
        >
          <X size={16} aria-hidden="true"/>
        </button>
      </div>
    </div>
  );
}
