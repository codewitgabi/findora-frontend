import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import { timeAgo } from "../lib/format";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../lib/me";
import { useApi } from "../lib/useapi";

const PAGE_SIZE = 20;

function icon(type: AppNotification["type"]): ReactNode {
  switch (type) {
    case "match":
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </>
      );
    case "claim":
      return (
        <>
          <path d="M12 22c5-1.5 8-5.5 8-10V5l-8-3-8 3v7c0 4.5 3 8.5 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
    case "message":
      return <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />;
    case "status":
      return (
        <>
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </>
      );
  }
}

/** Where a notification leads: its claim thread first, otherwise the item. */
function targetOf(notification: AppNotification) {
  if (notification.claim_id) return `/claims/${notification.claim_id}`;
  if (notification.item_id) return `/items/${notification.item_id}`;
  return null;
}

function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload, mutate } = useApi(() => listNotifications(page, PAGE_SIZE), `notifications:${page}`);

  async function handleOpen(notification: AppNotification) {
    const target = targetOf(notification);
    if (!target) {
      await handleRead(notification);
      return;
    }
    // Leaving the page anyway: a failed read-mark just leaves it unread, so don't
    // set an error nobody will see.
    if (!notification.is_read) await markNotificationRead(notification.id).catch(() => {});
    navigate(target);
  }

  async function handleRead(notification: AppNotification) {
    if (notification.is_read) return;
    setActionError("");
    try {
      await markNotificationRead(notification.id);
      mutate((previous) => ({
        ...previous,
        unread_count: Math.max(0, previous.unread_count - 1),
        items: previous.items.map((entry) => (entry.id === notification.id ? { ...entry, is_read: true } : entry)),
      }));
    } catch {
      setActionError("Unable to update that notification.");
    }
  }

  async function handleReadAll() {
    setActionError("");
    try {
      await markAllNotificationsRead();
      mutate((previous) => ({
        ...previous,
        unread_count: 0,
        items: previous.items.map((entry) => ({ ...entry, is_read: true })),
      }));
    } catch {
      setActionError("Unable to mark notifications as read.");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              Notifications
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Stay on top of your reports
            </h1>
          </div>
          <button
            type="button"
            onClick={handleReadAll}
            disabled={!data || data.unread_count === 0}
            className="shrink-0 text-sm font-medium text-fg-muted underline underline-offset-4 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>

        {actionError && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{actionError}</p>}

        <div className="mt-10 border-t border-border">
          <AsyncState
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={data?.items.length === 0}
            emptyText="No notifications yet. We'll tell you when something changes."
          >
            {data?.items.map((notification) => (
              <button
                type="button"
                key={notification.id}
                onClick={() => handleOpen(notification)}
                className="flex w-full gap-4 border-b border-border py-5 text-left transition-colors hover:bg-bg-soft"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    {icon(notification.type)}
                  </svg>
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className={`text-sm font-semibold ${
                        notification.is_read ? "text-fg-muted" : "text-fg"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span className="shrink-0 font-mono text-xs text-fg-muted">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">
                    {notification.message}
                  </p>
                  {targetOf(notification) && (
                    <p className="mt-2 text-xs font-semibold text-accent">
                      {notification.claim_id ? "Open claim" : "View report"} →
                    </p>
                  )}
                </div>

                {!notification.is_read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </AsyncState>
        </div>
        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />}
      </div>
    </AppShell>
  );
}

export default Notifications;
