import { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/appshell";
import ActionButton from "../components/actionbutton";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import { decideClaim, listAdminClaims, type AdminClaim } from "../lib/admin";
import { confirmCollection } from "../lib/claims";
import { FINDER_KEEPS_IT, heldAtLabel, officeHolding } from "../lib/found-items";
import { formatDate } from "../lib/format";
import { useApi } from "../lib/useapi";

const tabs = ["pending", "approved", "rejected", "all"] as const;

const inputClass =
  "w-full border border-border bg-surface px-4 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

/** Where a found item already sits, used to prefill the pickup location. */
function suggestedPickup(claim: AdminClaim) {
  return officeHolding(claim.item_handed_to);
}

function AdminClaims() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pickups, setPickups] = useState<Record<string, string>>({});
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

  async function run(id: string, action: () => Promise<unknown>, fallback: string) {
    setActionError("");
    setBusyId(id);
    try {
      await action();
    } catch (cause) {
      setActionError(errorMessage(cause, fallback));
    } finally {
      setBusyId("");
      reload();
    }
  }

  function decide(claim: AdminClaim, status: "approved" | "rejected") {
    const pickup = (pickups[claim.id] ?? suggestedPickup(claim)).trim();
    if (status === "approved" && !pickup) {
      setActionError(`Add a pickup location for "${claim.item_name}" before approving.`);
      return;
    }
    return run(
      claim.id,
      () => decideClaim(claim.id, status, notes[claim.id]?.trim(), status === "approved" ? pickup : undefined),
      "Unable to update that claim.",
    );
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Claims</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Verify ownership before release</h1>
        <p className="mt-2 text-fg-muted">
          Compare the evidence with the item before approving, and message the claimant if you need more. Approving takes
          the item off search, rejects other pending claims on it and tells the claimant and the reporter where the pickup
          happens. The item resolves once someone confirms collection.
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
            {data?.items.map((claim) => {
              const heldAt = claim.item_handed_to ? heldAtLabel(claim.item_handed_to) : null;
              return (
                <div key={claim.id} className="border-b border-border py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link to={`/items/${claim.item_id}`} className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline">
                        {claim.item_name} — {claim.item_location}
                      </Link>
                      {claim.item_report_type && (
                        <span className="ml-2 font-mono text-[10px] tracking-widest text-fg-muted uppercase">· {claim.item_report_type}</span>
                      )}
                      <p className="mt-0.5 text-xs text-fg-muted">
                        Claimant: {claim.claimant_name} · {claim.claimant_email} · {formatDate(claim.created_at)}
                      </p>
                      <p className="mt-0.5 text-xs text-fg-muted">
                        Reporter: {claim.reporter_name}
                        {heldAt && <> · {heldAt}</>}
                      </p>
                      <p className="mt-3 text-sm text-fg-muted">"{claim.evidence_text}"</p>
                      {claim.status === "approved" && claim.pickup_location && (
                        <p className="mt-2 text-xs">
                          Pickup: <span className="font-semibold">{claim.pickup_location}</span>
                        </p>
                      )}
                      {claim.status !== "pending" && claim.admin_note && (
                        <p className="mt-1 text-xs text-fg-muted">Note: {claim.admin_note}</p>
                      )}
                      <Link
                        to={`/claims/${claim.id}`}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-accent underline-offset-4 hover:underline"
                      >
                        {claim.has_unread_messages && <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />}
                        {claim.has_unread_messages ? "New message: open thread" : "Message thread"} →
                      </Link>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {claim.status !== "pending" && <StatusPill status={claim.handover_status ?? claim.status} />}
                      {claim.handover_status === "awaiting_pickup" && (
                        <ActionButton
                          label="Mark collected"
                          variant="approve"
                          disabled={busyId === claim.id}
                          onClick={() => run(claim.id, () => confirmCollection(claim.id), "Unable to confirm collection.")}
                        />
                      )}
                    </div>
                  </div>

                  {claim.status === "pending" && (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                      <input
                        type="text"
                        value={pickups[claim.id] ?? suggestedPickup(claim)}
                        onChange={(event) => setPickups((current) => ({ ...current, [claim.id]: event.target.value }))}
                        placeholder={
                          claim.item_handed_to === FINDER_KEEPS_IT
                            ? "Pickup location (finder still has it)"
                            : "Pickup location (required to approve)"
                        }
                        aria-label="Pickup location"
                        maxLength={255}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={notes[claim.id] ?? ""}
                        onChange={(event) => setNotes((current) => ({ ...current, [claim.id]: event.target.value }))}
                        placeholder="Note: pickup hours, ID needed, or rejection reason"
                        aria-label="Note for the claimant"
                        maxLength={1000}
                        className={inputClass}
                      />
                      <div className="flex shrink-0 gap-2">
                        <ActionButton label="Approve" variant="approve" disabled={busyId === claim.id} onClick={() => decide(claim, "approved")} />
                        <ActionButton label="Reject" variant="reject" disabled={busyId === claim.id} onClick={() => decide(claim, "rejected")} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </AsyncState>
        </div>
        {data && <Pagination page={page} pageSize={data.page_size} total={data.total} onPage={setPage} />}
      </div>
    </AppShell>
  );
}

export default AdminClaims;
