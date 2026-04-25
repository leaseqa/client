type PageLoadingStateProps = {
  message: string;
  detail?: string;
};

export default function PageLoadingState({
                                           message,
                                           detail,
                                         }: PageLoadingStateProps) {
  return (
    <section className="page-loading-state" aria-live="polite">
      <div className="spinner-border text-primary page-loading-spinner" role="status"/>
      <div className="page-loading-copy-wrap">
        <div className="page-loading-title">{message}</div>
        {detail ? <p className="page-loading-copy">{detail}</p> : null}
      </div>
    </section>
  );
}
