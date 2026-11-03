import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/appshell";
import ActionButton from "../components/actionbutton";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import StatusPill from "../components/statuspill";
import { errorMessage } from "../lib/api";
import { listAdminReports, setReportStatus } from "../lib/admin";
import { formatDate } from "../lib/format";
import { useApi } from "../lib/useapi";

const tabs = ["all", "pending", "active", "matched", "resolved", "rejected"] as const;

function AdminReports() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload } = useApi(
    () => listAdminReports({ status: tab === "all" ? undefined : tab, q: query, page }),
    `admin-reports:${tab}:${query}:${page}`,
  );

  function selectTab(next: (typeof tabs)[number]) {
    setTab(next);
    setPage(1);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery.trim());
    setPage(1);
  }

  async function change(id: string, status: "active" | "rejected" | "resolved") {
    setActionError("");
    setBusyId(id);
    try {
      await setReportStatus(id, status);
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to update that report."));
    } finally {
      setBusyId("");
      reload();
    }
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Reports</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Review lost and found reports</h1>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Search by item name or description"
            aria-label="Search reports"
            className="flex-1 border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
          />
          <button type="submit" className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85">
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
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
              {name === "matched" ? "Possible match" : name}
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
            emptyText="No reports in this view."
          >
            {data?.items.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link to={`/items/${report.id}`} className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline">
                    {report.item_name}
                  </Link>{" "}
                  <span className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">· {report.report_type}</span>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {report.reporter_name} · {report.location} · {formatDate(report.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={report.status} />
                  {report.status === "pending" && (
                    <>
                      <ActionButton label="Approve" variant="approve" disabled={busyId === report.id} onClick={() => change(report.id, "active")} />
                      <ActionButton label="Reject" variant="reject" disabled={busyId === report.id} onClick={() => change(report.id, "rejected")} />
                    </>
                  )}
                  {(report.status === "active" || report.status === "matched") && (
                    <ActionButton label="Mark resolved" variant="approve" disabled={busyId === report.id} onClick={() => change(report.id, "resolved")} />
                  )}
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

export default AdminReports;
