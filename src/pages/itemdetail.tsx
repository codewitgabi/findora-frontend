import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import { formatDate, percent } from "../lib/format";
import { getItem, submitClaim } from "../lib/items";
import { useApi } from "../lib/useapi";

function ItemDetail() {
  const { id = "" } = useParams();
  const { data: item, error, loading, reload } = useApi(() => getItem(id), `item:${id}`);
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

  const isLost = item?.report_type === "lost";
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

                  {item.is_owner && (
                    <p className="mt-2 text-sm text-fg-muted">
                      {item.status === "pending"
                        ? "This report is waiting for admin review. It becomes searchable once approved."
                        : "Claims from other users are reviewed by an administrator."}
                    </p>
                  )}

                  {!item.is_owner && claimStatus === "pending" && (
                    <p role="status" className="mt-2 border border-accent px-4 py-3 text-sm text-accent">
                      Your claim is pending review.{" "}
                      <Link to="/claims" className="font-semibold underline underline-offset-4">Track it</Link>
                    </p>
                  )}
                  {!item.is_owner && claimStatus === "approved" && (
                    <p role="status" className="mt-2 border border-accent px-4 py-3 text-sm text-accent">
                      Your claim was approved.{" "}
                      <Link to="/claims" className="font-semibold underline underline-offset-4">See collection details</Link>
                    </p>
                  )}
                  {!item.is_owner && !isClaimable && !claimStatus && (
                    <p className="mt-2 text-sm text-fg-muted">This item can't be claimed right now.</p>
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
                  <h2 className="text-lg font-semibold">Other possible matches</h2>
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
