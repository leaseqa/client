// One honest presentation for the three things a remote read can be.
//
// `PageLoadingState` already covers the loading case for full-page routes.
// This covers all three, including the two that routes currently tend to
// collapse into each other: an empty result and a failed request. Rendering an
// empty state after an error tells the renter there is nothing there, which is
// a different and wrong claim.

export type RemoteDataStateKind = "loading" | "empty" | "error";

export type RemoteDataStateProps = {
  kind: RemoteDataStateKind;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Renders the compact variant for sidebars and cards. */
  compact?: boolean;
  className?: string;
};

const ROLE_BY_KIND: Record<RemoteDataStateKind, string | undefined> = {
  loading: "status",
  empty: undefined,
  error: "alert",
};

export default function RemoteDataState({
                                         kind,
                                         title,
                                         description,
                                         action,
                                         compact = false,
                                         className,
                                       }: RemoteDataStateProps) {
  const classes = [
    "remote-data-state",
    `remote-data-state-${kind}`,
    compact ? "remote-data-state-compact" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={classes}
      role={ROLE_BY_KIND[kind]}
      // Loading and error both need announcing without stealing focus.
      aria-live={kind === "empty" ? undefined : "polite"}
      aria-busy={kind === "loading" ? true : undefined}
      data-state={kind}
    >
      {kind === "loading" ? (
        <span className="remote-data-state-spinner" aria-hidden="true"/>
      ) : null}
      <div className="remote-data-state-copy">
        <p className="remote-data-state-title">{title}</p>
        {description ? (
          <p className="remote-data-state-description">{description}</p>
        ) : null}
        {action ? (
          <button
            type="button"
            className="remote-data-state-action"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}
