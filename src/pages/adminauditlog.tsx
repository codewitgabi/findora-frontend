import { useState } from "react";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import { listAuditLogs } from "../lib/admin";
import { formatDateTime } from "../lib/format";
import { useApi } from "../lib/useapi";

const targets = ["all", "claim", "report", "user", "category"] as const;

function AdminAuditLog() {
  const [target, setTarget] = useState<(typeof targets)[number]>("all");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(
    () => listAuditLogs({ target_type: target === "all" ? undefined : target, page }),
    `audit:${target}:${page}`,
  );

  function selectTarget(next: (typeof targets)[number]) {
    setTarget(next);
    setPage(1);
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Audit log</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Every admin action, on record</h1>
        <p className="mt-2 text-fg-muted">Entries are read-only and can't be edited or removed.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {targets.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => selectTarget(name)}
              className={`border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                target === name
                  ? "border-accent text-accent"
                  : "border-border text-fg-muted hover:border-accent hover:text-accent"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-border">
          <AsyncState
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={data?.items.length === 0}
            emptyText="No entries in this view."
          >
            {data?.items.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 border-b border-border py-4">
                <div className="min-w-0">
                  <p className="text-sm">{entry.action}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    Admin — {entry.admin_name} ·{" "}
                    <span className="font-mono text-[10px] tracking-widest uppercase">{entry.target_type}</span>
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-fg-muted">{formatDateTime(entry.created_at)}</span>
              </div>
            ))}
          </AsyncState>
        </div>
        {data && <Pagination page={page} pageSize={data.page_size} total={data.total} onPage={setPage} />}
      </div>
    </AppShell>
  );
}

export default AdminAuditLog;
