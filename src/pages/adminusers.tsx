import { useState, type FormEvent } from "react";
import AppShell from "../components/appshell";
import ActionButton from "../components/actionbutton";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import { listAdminUsers, setUserRole, setUserStatus } from "../lib/admin";
import { formatDate } from "../lib/format";
import { useApi } from "../lib/useapi";

function AdminUsers() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload } = useApi(() => listAdminUsers({ q: query, page }), `admin-users:${query}:${page}`);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery.trim());
    setPage(1);
  }

  async function changeRole(id: string, role: "user" | "officer") {
    setActionError("");
    setBusyId(id);
    try {
      await setUserRole(id, role);
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to change that role."));
    } finally {
      setBusyId("");
      reload();
    }
  }

  async function change(id: string, status: "active" | "suspended") {
    setActionError("");
    setBusyId(id);
    try {
      await setUserStatus(id, status);
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to update that account."));
    } finally {
      setBusyId("");
      reload();
    }
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Users</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage accounts</h1>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
            className="flex-1 border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
          />
          <button type="submit" className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85">
            Search
          </button>
        </form>

        {actionError && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{actionError}</p>}

        <div className="mt-6 border-t border-border">
          <AsyncState
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={data?.items.length === 0}
            emptyText="No users match your search."
          >
            {data?.items.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {user.full_name}{" "}
                    <span className="font-mono text-[10px] font-normal tracking-widest text-fg-muted uppercase">· {user.role}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {user.email}
                    {user.student_id && <> · ID {user.student_id}</>} · Joined {formatDate(user.created_at)} · {user.report_count} {user.report_count === 1 ? "report" : "reports"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={user.account_status} />
                  {user.role === "user" && user.account_status === "active" && (
                    <ActionButton label="Make officer" variant="approve" disabled={busyId === user.id} onClick={() => changeRole(user.id, "officer")} />
                  )}
                  {user.role === "officer" && (
                    <ActionButton label="Remove officer" variant="reject" disabled={busyId === user.id} onClick={() => changeRole(user.id, "user")} />
                  )}
                  {user.role !== "admin" &&
                    (user.account_status === "active" ? (
                      <ActionButton label="Suspend" variant="reject" disabled={busyId === user.id} onClick={() => change(user.id, "suspended")} />
                    ) : (
                      <ActionButton label="Reinstate" variant="approve" disabled={busyId === user.id} onClick={() => change(user.id, "active")} />
                    ))}
                </div>
              </div>
            ))}
          </AsyncState>
        </div>
        {data && <Pagination page={page} pageSize={data.page_size} total={data.total} onPage={setPage} />}
      </div>
    </AppShell>
  );
}

export default AdminUsers;
