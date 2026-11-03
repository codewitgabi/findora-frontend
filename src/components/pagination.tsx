function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const buttonClass =
    "border border-border px-3.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg-muted";

  return (
    <div className="mt-6 flex items-center justify-between">
      <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className="font-mono text-xs text-fg-muted">
        Page {page} of {pages}
      </span>
      <button type="button" className={buttonClass} disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

export default Pagination;
