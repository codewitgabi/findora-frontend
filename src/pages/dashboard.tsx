import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import StatusPill from "../components/statuspill";
import { getCurrentUser } from "../lib/auth";
import { getSummary, listMyReports } from "../lib/me";
import { useApi } from "../lib/useapi";

const PAGE_SIZE = 10;

function Dashboard() {
  const user = getCurrentUser();
  const location = useLocation();
  const submitted = (location.state as { submitted?: "lost" | "found" } | null)?.submitted;
  const displayName = user?.full_name?.trim() || user?.email.split("@")[0] || "there";
  const [page, setPage] = useState(1);
  const summary = useApi(getSummary, "summary");
  const reports = useApi(() => listMyReports(page, PAGE_SIZE), `reports:${page}`);

  const stats = [
    { label: "My reports", value: summary.data?.my_reports },
    { label: "Possible matches", value: summary.data?.active_matches },
    { label: "Claims pending", value: summary.data?.claims_pending },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Welcome back, {displayName}.
        </h1>

        {submitted && (
          <p role="status" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">
            Your {submitted} report was submitted for review. You'll be notified once an admin approves it.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/report"
            className="flex-1 border border-fg bg-fg px-6 py-4 text-center text-sm font-semibold text-bg transition-opacity hover:opacity-85"
          >
            Report a lost item
          </Link>
          <Link
            to="/report/found"
            className="flex-1 border border-border px-6 py-4 text-center text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
          >
            Report a found item
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 divide-x divide-border border-y border-border">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center">
              <p className="font-mono text-2xl font-bold">{stat.value ?? "–"}</p>
              <p className="mt-1 text-xs text-fg-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your reports</h2>
            <Link
              to="/search"
              className="text-sm font-medium text-fg-muted underline underline-offset-4 hover:text-fg"
            >
              Search all items
            </Link>
          </div>

          <div className="mt-4 border-t border-border">
            <AsyncState
              loading={reports.loading}
              error={reports.error}
              onRetry={reports.reload}
              isEmpty={reports.data?.items.length === 0}
              emptyText="You haven't reported anything yet."
            >
              {reports.data?.items.map((report) => (
                <Link
                  key={report.id}
                  to={`/items/${report.id}`}
                  className="flex items-center justify-between gap-4 border-b border-border py-4 transition-colors hover:bg-bg-soft"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{report.item_name}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {report.report_type === "lost" ? "Lost" : "Found"} · {report.last_seen_or_found_location}
                    </p>
                  </div>
                  <StatusPill status={report.status} />
                </Link>
              ))}
            </AsyncState>
          </div>
          {reports.data && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={reports.data.total} onPage={setPage} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;
