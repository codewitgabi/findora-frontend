import { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import StatusPill from "../components/statuspill";
import { formatDate } from "../lib/format";
import { listMyClaims } from "../lib/me";
import { useApi } from "../lib/useapi";

function Claims() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(() => listMyClaims(page), `claims:${page}`);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">My claims</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Track your claim requests</h1>
        <p className="mt-2 text-fg-muted">
          Every claim is reviewed by an administrator before an item is released.
        </p>

        <div className="mt-8 border-t border-border">
          <AsyncState
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={data?.items.length === 0}
            emptyText="You haven't submitted any claims yet."
          >
            {data?.items.map((claim) => (
              <div key={claim.id} className="border-b border-border py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={`/items/${claim.item_id}`}
                      className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline"
                    >
                      {claim.item_name} — {claim.item_location}
                    </Link>
                    <p className="mt-0.5 text-xs text-fg-muted">Submitted {formatDate(claim.created_at)}</p>
                  </div>
                  <StatusPill status={claim.status} />
                </div>
                <p className="mt-3 text-sm text-fg-muted">"{claim.evidence_text}"</p>
                {claim.admin_note && <p className="mt-2 text-xs text-fg-muted">{claim.admin_note}</p>}
                {!claim.admin_note && claim.status === "pending" && (
                  <p className="mt-2 text-xs text-fg-muted">An administrator is reviewing your evidence.</p>
                )}
              </div>
            ))}
          </AsyncState>
        </div>
        {data && <Pagination page={page} pageSize={data.page_size} total={data.total} onPage={setPage} />}

        <p className="mt-8 text-sm text-fg-muted">
          Looking for something else?{" "}
          <Link to="/search" className="font-medium text-fg underline underline-offset-4 hover:text-accent">
            Search all items
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

export default Claims;
