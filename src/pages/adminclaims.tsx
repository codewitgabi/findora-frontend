import { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/appshell";
import ActionButton from "../components/actionbutton";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import { decideClaim, listAdminClaims } from "../lib/admin";
import { formatDate } from "../lib/format";
import { useApi } from "../lib/useapi";

const tabs = ["pending", "approved", "rejected", "all"] as const;

function AdminClaims() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload } = useApi(
    () => listAdminClaims({ status: tab === "all" ? undefined : tab, page }),
    `admin-claims:${tab}:${page}`,
  );

  function selectTab(next: (typeof tabs)[number]) {
    setTab(next);
    setPage(1);
  }

  async function decide(id: string, status: "approved" | "rejected") {
    setActionError("");
    setBusyId(id);
    try {
      await decideClaim(id, status, notes[id]?.trim());
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to update that claim."));
    } finally {
      setBusyId("");
      reload();
    }
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Claims</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Verify ownership before release</h1>
        <p className="mt-2 text-fg-muted">
          Compare the evidence with the item before approving. Approving a claim resolves the item and rejects other pending claims on it.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => selectTab(name)}
              className={`border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                tab === name
                  ? "border-accent text-accent"
                  : "border-border text-fg-muted hover:border-accent hover:text-accent"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {actionError && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{actionError}</p>}

        <div className="mt-6 border-t border-border">
          <AsyncState
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={data?.items.length === 0}
            emptyText="No claims in this view."
          >
            {data?.items.map((claim) => (
              <div key={claim.id} className="border-b border-border py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link to={`/items/${claim.item_id}`} className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline">
                      {claim.item_name} — {claim.item_location}
                    </Link>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {claim.claimant_name} · {claim.claimant_email} · {formatDate(claim.created_at)}
                    </p>
                    <p className="mt-3 text-sm text-fg-muted">"{claim.evidence_text}"</p>
                  </div>
                  {claim.status !== "pending" && <StatusPill status={claim.status} />}
                </div>

                {claim.status === "pending" && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={notes[claim.id] ?? ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [claim.id]: event.target.value }))}
                      placeholder="Note for the claimant (pickup details or rejection reason)"
                      aria-label="Note for the claimant"
                      maxLength={1000}
                      className="flex-1 border border-border bg-surface px-4 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
                    />
                    <div className="flex shrink-0 gap-2">
                      <ActionButton label="Approve" variant="approve" disabled={busyId === claim.id} onClick={() => decide(claim.id, "approved")} />
                      <ActionButton label="Reject" variant="reject" disabled={busyId === claim.id} onClick={() => decide(claim.id, "rejected")} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </AsyncState>
        </div>
        {data && <Pagination page={page} pageSize={data.page_size} total={data.total} onPage={setPage} />}
      </div>
    </AppShell>
  );
}

export default AdminClaims;
