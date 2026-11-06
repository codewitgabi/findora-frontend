import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import { formatDate, percent } from "../lib/format";
import { closeItem, getItem, submitClaim, type CloseReason } from "../lib/items";
import { FINDER_KEEPS_IT } from "../lib/found-items";
import { OPEN_STATUSES } from "../lib/me";
import { useApi } from "../lib/useapi";


const closeReasonText: Record<CloseReason, string> = {
  found_it: "The reporter found the item themselves.",
  no_longer_needed: "The reporter closed this report.",
  other: "The reporter closed this report.",
  removed_by_admin: "This report was removed by an administrator.",
  duplicate: "This report was closed as a duplicate of another report.",
};

function ItemDetail() {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Show the "submitted" banner once, then drop it from history so a reload or Back
  // doesn't claim the report is still awaiting review.
  const [submitted] = useState((location.state as { submitted?: "lost" | "found" } | null)?.submitted);
  useEffect(() => {
    if (submitted) navigate(location.pathname, { replace: true, state: null });
  }, [submitted, navigate, location.pathname]);
  const [closing, setClosing] = useState(false);
  const [closeReason, setCloseReason] = useState<"found_it" | "no_longer_needed" | "other">("found_it");
  const [closeNote, setCloseNote] = useState("");
  const [closeError, setCloseError] = useState("");
  const [isClosingBusy, setIsClosingBusy] = useState(false);
  const { data: item, error, loading, reload, mutate } = useApi(() => getItem(id), `item:${id}`);
  const [evidence, setEvidence] = useState("");
  const [claimError, setClaimError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClaimError("");
    setIsSubmitting(true);
    try {
      await submitClaim(id, evidence.trim());
      setEvidence("");
      reload();
    } catch (cause) {
      setClaimError(errorMessage(cause, "Unable to submit your claim."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCloseError("");
    setIsClosingBusy(true);
    try {
      const updated = await closeItem(id, closeReason, closeNote.trim());
      setClosing(false);
      mutate(() => updated);
    } catch (cause) {
      setCloseError(errorMessage(cause, "Unable to close this report."));
    } finally {
      setIsClosingBusy(false);
    }
  }

  const isLost = item?.report_type === "lost";
  const isOpen = Boolean(item && OPEN_STATUSES.includes(item.status));
  const isClaimable = item && !item.is_owner && (item.status === "active" || item.status === "matched");
  const claimStatus = item?.my_claim?.status;
  const canClaim = isClaimable && (!claimStatus || claimStatus === "rejected");

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Back to search
        </Link>

        {submitted && (
          <p role="status" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">
            Your {submitted} report was submitted for review. It becomes searchable once an administrator approves it, and we'll
            notify you about matches. Possible matches already on file are listed below.
          </p>
        )}

        <AsyncState loading={loading} error={error} onRetry={reload}>
          {item && (
            <>
              <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[20rem_1fr]">
                <div className="flex aspect-square items-center justify-center overflow-hidden border border-border bg-bg-soft text-fg-muted">
                  {item.photo ? (
                    <img src={item.photo} alt={item.item_name} className="h-full w-full object-cover" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      className="h-16 w-16"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{item.item_name}</h1>
                    <div className="flex items-center gap-2">
                      <span className="border border-accent px-2.5 py-1 font-mono text-[10px] tracking-widest text-accent uppercase">
                        {isLost ? "Lost" : "Found"}
                      </span>
                      <StatusPill status={item.status} />
                    </div>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 sm:grid-cols-4">
                    {[
                      { label: "Category", value: item.category },
                      { label: "Color", value: item.color },
                      { label: isLost ? "Last seen" : "Found at", value: item.location },
                      { label: isLost ? "Date lost" : "Date found", value: formatDate(item.date) },
                      ...(item.condition ? [{ label: "Condition", value: item.condition }] : []),
                      ...(item.handed_to
                        ? [{ label: "Held at", value: item.handed_to === FINDER_KEEPS_IT ? "With the finder" : item.handed_to }]
                        : []),
                    ].map((field) => (
                      <div key={field.label}>
                        <dt className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">
                          {field.label}
                        </dt>
                        <dd className="mt-1 text-sm font-medium">{field.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6">
                    <h2 className="text-sm font-semibold">Description</h2>
                    <p className="mt-2 text-sm whitespace-pre-line text-fg-muted">{item.description}</p>
                  </div>

                  {item.identifying_marks && (
                    <div className="mt-4 border border-dashed border-border px-4 py-3">
                      <h2 className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">
                        Identifying marks · private to you and campus staff
                      </h2>
                      <p className="mt-1 text-sm whitespace-pre-line">{item.identifying_marks}</p>
                    </div>
                  )}

                  {item.status === "closed" && item.close_reason && (
                    <p className="mt-4 border border-border px-4 py-3 text-sm text-fg-muted">{closeReasonText[item.close_reason]}</p>
                  )}

                  {item.is_owner && isOpen && !closing && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        to={`/items/${item.id}/edit`}
                        className="border border-fg px-4 py-2 text-sm font-semibold transition-colors hover:bg-fg hover:text-bg"
                      >
                        Edit report
                      </Link>
                      <button
                        type="button"
                        onClick={() => setClosing(true)}
                        className="border border-border px-4 py-2 text-sm font-semibold text-fg-muted transition-colors hover:border-fg hover:text-fg"
                      >
                        Close report
                      </button>
                    </div>
                  )}

                  {item.is_owner && isOpen && closing && (
                    <form className="mt-6 space-y-3 border border-border p-4" onSubmit={handleClose}>
                      <p className="text-sm font-semibold">Close this report?</p>
                      <p className="text-xs text-fg-muted">
                        It leaves search, and any pending claims on it are closed. This can't be undone.
                      </p>
                      {closeError && <p role="alert" className="text-sm text-accent">{closeError}</p>}
                      <select
                        aria-label="Reason"
                        value={closeReason}
                        onChange={(event) => setCloseReason(event.target.value as typeof closeReason)}
                        className="w-full border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
                      >
                        <option value="found_it">{isLost ? "I found it myself" : "The owner already has it"}</option>
                        <option value="no_longer_needed">I no longer need this report</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        value={closeNote}
                        onChange={(event) => setCloseNote(event.target.value)}
                        maxLength={500}
                        placeholder="Optional note"
                        aria-label="Note"
                        className="w-full border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isClosingBusy}
                          className="border border-fg bg-fg px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60"
                        >
                          {isClosingBusy ? "Closing..." : "Close report"}
                        </button>
                        <button type="button" onClick={() => setClosing(false)} className="px-4 py-2 text-sm text-fg-muted hover:text-fg">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <p className="mt-6 text-xs text-fg-muted">
                    Reported by a verified campus user · contact is only shared
                    after a claim is approved.
                  </p>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.is_owner ? "Your report" : "Submit a claim"}
                  </h2>

                  {item.is_owner && !item.handover && (
                    <p className="mt-2 text-sm text-fg-muted">
                      {item.status === "pending"
                        ? "This report is waiting for admin review. It becomes searchable once approved."
                        : item.status === "resolved"
                          ? "This report is resolved."
                          : item.status === "closed"
                            ? "This report is closed."
                            : item.status === "rejected"
                              ? "This report was not approved."
                          : "Claims from other users are reviewed by an administrator. We'll notify you when someone comes forward."}
                    </p>
                  )}

                  {item.handover && (
                    <div className="mt-2 border border-accent p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
                          {item.handover.handover_status === "collected" ? "Handed over" : "Claim approved"}
                        </p>
                        {item.handover.handover_status && <StatusPill status={item.handover.handover_status} />}
                      </div>
                      {item.handover.pickup_location && (
                        <p className="mt-2 text-sm">
                          Pickup location: <span className="font-semibold">{item.handover.pickup_location}</span>
                        </p>
                      )}
                      <Link
                        to={`/claims/${item.handover.claim_id}`}
                        className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4"
                      >
                        {item.handover.handover_status === "awaiting_pickup" ? "Arrange the handover" : "View conversation"}
                      </Link>
                    </div>
                  )}

                  {item.is_owner && item.matched_items.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold">Possible matches for your report</h3>
                      <p className="mt-1 text-xs text-fg-muted">
                        {isLost
                          ? "If one of these is yours, open it and submit a claim with details only you would know."
                          : "These lost reports may describe this item. Their owners have been notified."}
                      </p>
                      <div className="mt-3 border-t border-border">
                        {item.matched_items.map((match) => (
                          <Link
                            key={match.id}
                            to={`/items/${match.id}`}
                            className="flex items-center justify-between gap-4 border-b border-border py-3 transition-colors hover:bg-bg-soft"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{match.item_name}</p>
                              <p className="mt-0.5 text-xs text-fg-muted">
                                {match.report_type === "found" ? "Found" : "Lost"} · {match.location}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-accent">{isLost ? "Review & claim →" : "View →"}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {!item.is_owner && item.my_claim && claimStatus === "pending" && (
                    <p role="status" className="mt-2 border border-accent px-4 py-3 text-sm text-accent">
                      Your claim is pending review.{" "}
                      <Link to={`/claims/${item.my_claim.id}`} className="font-semibold underline underline-offset-4">
                        Track it or message the admin
                      </Link>
                    </p>
                  )}
                  {!item.is_owner && item.my_claim && claimStatus === "approved" && (
                    <div role="status" className="mt-2 border border-accent p-4 text-sm">
                      <p className="font-semibold text-accent">
                        {item.my_claim.handover_status === "collected" ? "You collected this item." : "Your claim was approved."}
                      </p>
                      {item.my_claim.pickup_location && (
                        <p className="mt-1">
                          {item.my_claim.handover_status === "collected" ? "Collected from" : "Collect it at"}:{" "}
                          <span className="font-semibold">{item.my_claim.pickup_location}</span>
                        </p>
                      )}
                      <Link to={`/claims/${item.my_claim.id}`} className="mt-2 inline-block font-semibold text-accent underline underline-offset-4">
                        {item.my_claim.handover_status === "awaiting_pickup" ? "Pickup details and confirmation" : "View conversation"}
                      </Link>
                    </div>
                  )}
                  {!item.is_owner && !isClaimable && !claimStatus && (
                    <p className="mt-2 text-sm text-fg-muted">
                      {item.status === "claimed"
                        ? "A claim on this item was approved and it is awaiting pickup."
                        : "This item can't be claimed right now."}
                    </p>
                  )}

                  {canClaim && (
                    <>
                      <p className="mt-2 text-sm text-fg-muted">
                        {claimStatus === "rejected"
                          ? "Your last claim was rejected. You can submit a new one with more detail. "
                          : ""}
                        Describe something only the owner would know — contents,
                        markings, or where it was lost.
                      </p>
                      {claimError && (
                        <p role="alert" className="mt-4 border border-accent px-4 py-3 text-sm text-accent">{claimError}</p>
                      )}
                      <form className="mt-5 space-y-4" onSubmit={handleClaim}>
                        <textarea
                          rows={4}
                          value={evidence}
                          onChange={(event) => setEvidence(event.target.value)}
                          minLength={10}
                          maxLength={2000}
                          required
                          placeholder="e.g. It has a red keychain and a dented zipper pull."
                          className="w-full resize-none border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                        >
                          {isSubmitting ? "Submitting claim..." : "Submit claim"}
                        </button>
                      </form>
                    </>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    {item.status === "pending" ? "Possible matches already on file" : "Other possible matches"}
                  </h2>
                  {item.similar_items.length === 0 ? (
                    <p className="mt-5 text-sm text-fg-muted">No similar items found yet.</p>
                  ) : (
                    <div className="mt-5 border-t border-border">
                      {item.similar_items.map((match) => (
                        <Link
                          key={match.id}
                          to={`/items/${match.id}`}
                          className="flex items-center justify-between gap-4 border-b border-border py-4 transition-colors hover:bg-bg-soft"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{match.item_name}</p>
                            <p className="mt-0.5 text-xs text-fg-muted">{match.location}</p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-accent">
                            {percent(match.score)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </AsyncState>
      </div>
    </AppShell>
  );
}

export default ItemDetail;
