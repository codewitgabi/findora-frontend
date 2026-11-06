import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import {
  confirmCollection,
  getClaim,
  listClaimMessages,
  roleLabel,
  sendClaimMessage,
  type ClaimDetail,
} from "../lib/claims";
import { formatDate, formatDateTime } from "../lib/format";
import { useApi } from "../lib/useapi";

// No push channel, so poll the thread while the page is open.
const POLL_MS = 20_000;

function introText(claim: ClaimDetail) {
  const awaiting = claim.handover_status === "awaiting_pickup";
  if (claim.my_role === "reporter") {
    return awaiting
      ? "An administrator approved this claim. Use this thread to arrange the handover. Contact details are never shared."
      : "This item was handed over. Thank you for returning it.";
  }
  if (claim.my_role === "admin") {
    return claim.status === "pending"
      ? "Ask the claimant for anything you need before deciding. The reporter joins this thread once the claim is approved."
      : "Conversation between the claimant, the reporter and administrators.";
  }
  if (claim.status === "pending") {
    return "An administrator is reviewing your evidence and may ask questions here.";
  }
  if (awaiting) return "Your claim was approved. Collect the item at the location below and confirm once you have it.";
  if (claim.handover_status === "collected") return "You collected this item. This claim is closed.";
  return "This claim was not approved.";
}

function ClaimThread() {
  const { id = "" } = useParams();
  const claim = useApi(() => getClaim(id), `claim:${id}`);
  const messages = useApi(() => listClaimMessages(id), `claim-messages:${id}`);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const reloadMessages = messages.reload;
  useEffect(() => {
    const timer = window.setInterval(reloadMessages, POLL_MS);
    return () => window.clearInterval(timer);
  }, [reloadMessages]);

  const messageCount = messages.data?.items.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messageCount]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setActionError("");
    setSending(true);
    try {
      const sent = await sendClaimMessage(id, body);
      setDraft("");
      messages.mutate((previous) => ({ items: [...previous.items, sent] }));
      // Refetch too: this discards any poll already in flight (which would drop the new
      // message) and covers the case where the thread never loaded.
      messages.reload();
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to send your message."));
    } finally {
      setSending(false);
    }
  }

  async function handleConfirm() {
    setActionError("");
    setConfirming(true);
    try {
      const updated = await confirmCollection(id);
      claim.mutate(() => updated);
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to confirm collection."));
      claim.reload();
    } finally {
      setConfirming(false);
    }
  }

  const data = claim.data;
  const backTo = data?.my_role === "admin" ? "/admin/claims" : data?.my_role === "reporter" ? `/items/${data.item_id}` : "/claims";
  const backLabel = data?.my_role === "admin" ? "Back to claims queue" : data?.my_role === "reporter" ? "Back to your report" : "Back to my claims";

  return (
    <AppShell variant={data?.my_role === "admin" ? "admin" : undefined}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          {backLabel}
        </Link>

        <AsyncState loading={claim.loading} error={claim.error} onRetry={claim.reload}>
          {data && (
            <>
              <div className="mt-6 flex items-start gap-5">
                {data.item_photo && (
                  <img src={data.item_photo} alt="" className="h-20 w-20 shrink-0 border border-border object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs tracking-widest text-accent uppercase">
                    Claim · you are the {roleLabel(data.my_role, data.item_report_type).toLowerCase()}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight">
                    <Link to={`/items/${data.item_id}`} className="underline-offset-4 hover:text-accent hover:underline">
                      {data.item_name}
                    </Link>
                  </h1>
                  <p className="mt-1 text-sm text-fg-muted">
                    {data.item_report_type === "found" ? "Found at" : "Last seen"} {data.item_location} · claimed {formatDate(data.created_at)}
                  </p>
                </div>
                <StatusPill status={data.handover_status ?? data.status} />
              </div>

              <p className="mt-6 text-sm text-fg-muted">{introText(data)}</p>

              {data.status === "approved" && (
                <div className="mt-6 border border-accent p-5">
                  <p className="font-mono text-[10px] tracking-widest text-accent uppercase">Pickup location</p>
                  <p className="mt-1 text-lg font-semibold">{data.pickup_location ?? "Ask an administrator in the thread below."}</p>
                  {data.admin_note && <p className="mt-2 text-sm text-fg-muted">{data.admin_note}</p>}
                  {data.collected_at && (
                    <p className="mt-3 text-sm text-fg-muted">Collected {formatDateTime(data.collected_at)}.</p>
                  )}
                  {data.can_confirm_collection && (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="mt-4 border border-fg bg-fg px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {confirming
                        ? "Confirming..."
                        : data.my_role === "claimant"
                          ? "I've collected it"
                          : data.my_role === "reporter"
                            ? "I've handed it over"
                            : "Mark as collected"}
                    </button>
                  )}
                </div>
              )}

              {data.status === "rejected" && data.admin_note && (
                <p className="mt-6 border border-border px-4 py-3 text-sm text-fg-muted">{data.admin_note}</p>
              )}

              {data.evidence_text && (
                <div className="mt-6">
                  <p className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Ownership evidence</p>
                  <p className="mt-1 text-sm whitespace-pre-line text-fg-muted">"{data.evidence_text}"</p>
                </div>
              )}

              {actionError && (
                <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{actionError}</p>
              )}

              <h2 className="mt-10 text-lg font-semibold">Conversation</h2>
              <div className="mt-4 border-t border-border">
                <AsyncState
                  loading={messages.loading}
                  error={messages.error}
                  onRetry={messages.reload}
                  isEmpty={messageCount === 0}
                  emptyText={data.can_message ? "No messages yet. Start the conversation below." : "No messages were exchanged."}
                >
                  <ul className="space-y-4 py-5">
                    {messages.data?.items.map((message) => (
                      <li key={message.id} className={`flex ${message.is_mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] border px-4 py-3 ${message.is_mine ? "border-fg" : "border-border bg-bg-soft"}`}>
                          <p className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">
                            {message.is_mine ? "You" : roleLabel(message.sender_role, data.item_report_type)} · {formatDateTime(message.created_at)}
                          </p>
                          <p className="mt-1 text-sm whitespace-pre-line">{message.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AsyncState>
                <div ref={bottomRef} />
              </div>

              {data.can_message ? (
                <form className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSend}>
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={2000}
                    required
                    aria-label="Message"
                    placeholder={data.my_role === "admin" ? "Ask for more detail or share pickup instructions" : "Write a message. Don't share passwords or payment details."}
                    className="flex-1 resize-none border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              ) : (
                <p className="mt-2 text-xs text-fg-muted">This conversation is closed.</p>
              )}
            </>
          )}
        </AsyncState>
      </div>
    </AppShell>
  );
}

export default ClaimThread;
