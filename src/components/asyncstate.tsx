import type { ReactNode } from "react";

function AsyncState({
  loading,
  error,
  isEmpty,
  emptyText,
  onRetry,
  children,
}: {
  loading: boolean;
  error?: string;
  isEmpty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading) {
    return <p className="py-8 font-mono text-xs tracking-widest text-fg-muted uppercase">Loading...</p>;
  }

  if (error) {
    return (
      <div role="alert" className="my-6 flex items-center justify-between gap-4 border border-accent px-4 py-3 text-sm text-accent">
        <span>{error}</span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline underline-offset-4">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="py-8 text-sm text-fg-muted">{emptyText ?? "Nothing here yet."}</p>;
  }

  return <>{children}</>;
}

export default AsyncState;
