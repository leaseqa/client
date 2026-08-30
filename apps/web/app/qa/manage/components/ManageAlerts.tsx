import React from "react";
import { X } from "lucide-react";

type Latest = { kind: "error" | "success"; message: string } | null | undefined;

type ManageAlertsProps = {
  // New unified latest surface
  latest?: Latest;
  onClearLatest?: () => void;
  // Back-compat older props
  error?: string;
  success?: string;
  onClearError?: () => void;
  onClearSuccess?: () => void;
};

export default function ManageAlerts({
                                       latest,
                                       onClearLatest,
                                       error = "",
                                       success = "",
                                       onClearError,
                                       onClearSuccess,
                                     }: ManageAlertsProps) {
  // Determine latest: prefer explicit `latest`.
  // For legacy props, only map when exactly one is set to avoid guessing.
  let resolvedLatest: Latest = latest ?? null;
  if ( !resolvedLatest ) {
    const hasErr = Boolean(error);
    const hasOk = Boolean(success);
    if ( hasErr !== hasOk ) {
      resolvedLatest = hasErr ? { kind: "error", message: error } : { kind: "success", message: success };
    }
  }

  if ( !resolvedLatest ) return null;

  if ( resolvedLatest.kind === "error" ) {
    return (
      <div className="manage-alert error">
        {resolvedLatest.message}
        <button onClick={onClearLatest ?? onClearError}>
          <X size={12}/>
        </button>
      </div>
    );
  }

  return (
    <div className="manage-alert success">
      {resolvedLatest.message}
      <button onClick={onClearLatest ?? onClearSuccess}>
        <X size={12}/>
      </button>
    </div>
  );
}
