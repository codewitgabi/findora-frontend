import { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/appshell";
import ActionButton from "../components/actionbutton";
import AsyncState from "../components/asyncstate";
import { errorMessage } from "../lib/api";
import { formatDate, timeAgo } from "../lib/format";
import { getAdminStats, listAdminClaims, listAdminReports, listAuditLogs, setReportStatus } from "../lib/admin";
import { useApi } from "../lib/useapi";

function Admin() {
  const stats = useApi(getAdminStats, "stats");
  const reports = useApi(() => listAdminReports({ status: "pending", page_size: 5 }), "pending-reports");
  const claims = useApi(() => listAdminClaims({ status: "pending", page_size: 5 }), "pending-claims");
  const audit = useApi(() => listAuditLogs({}), "audit-preview");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  const cards = [
    { label: "Pending reports", value: stats.data?.pending_reports },
    { label: "Pending claims", value: stats.data?.pending_claims },
    { label: "Flagged items", value: stats.data?.flagged_items },
    { label: "Resolved this week", value: stats.data?.resolved_this_week },
  ];

  async function review(id: string, status: "active" | "rejected") {
    setActionError("");
    setBusyId(id);
    try {
      await setReportStatus(id, status);
      reports.reload();
      stats.reload();
      audit.reload();
    } catch (cause) {
      setActionError(errorMessage(cause, "Unable to update that report."));
      reports.reload();
    } finally {
      setBusyId("");
    }
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          Admin console
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Review reports, verify claims, keep records clean.
        </h1>

        {stats.error && (
          <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{stats.error}</p>
        )}
        <div className="mt-8 grid grid-cols-2 divide-x divide-y divide-border border border-border sm:grid-cols-4 sm:divide-y-0">
          {cards.map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center">
              <p className="font-mono text-2xl font-bold">{stat.value ?? "–"}</p>
              <p className="mt-1 text-xs text-fg-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending reports</h2>
            <Link to="/admin/reports" className="text-sm font-medium text-fg-muted underline underline-offset-4 hover:text-fg">
              View all
            </Link>
          </div>
          {actionError && <p role="alert" className="mt-4 border border-accent px-4 py-3 text-sm text-accent">{actionError}</p>}
          <div className="mt-4 border-t border-border">
            <AsyncState
              loading={reports.loading}
              error={reports.error}
              onRetry={reports.reload}
              isEmpty={reports.data?.items.length === 0}
              emptyText="No reports are waiting for review."
            >
              {reports.data?.items.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link to={`/items/${report.id}`} className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline">
                      {report.item_name}
                    </Link>{" "}
                    <span className="font-mono text-[10px] font-normal tracking-widest text-fg-muted uppercase">
                      · {report.report_type}
                    </span>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      Reported by {report.reporter_name} · {formatDate(report.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton label="Approve" variant="approve" disabled={busyId === report.id} onClick={() => review(report.id, "active")} />
                    <ActionButton label="Reject" variant="reject" disabled={busyId === report.id} onClick={() => review(report.id, "rejected")} />
                  </div>
                </div>
              ))}
            </AsyncState>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending claims</h2>
            <Link to="/admin/claims" className="text-sm font-medium text-fg-muted underline underline-offset-4 hover:text-fg">
              Review claims
            </Link>
          </div>
          <div className="mt-4 border-t border-border">
            <AsyncState
              loading={claims.loading}
              error={claims.error}
              onRetry={claims.reload}
              isEmpty={claims.data?.items.length === 0}
              emptyText="No claims are waiting for review."
            >
              {claims.data?.items.map((claim) => (
                <div key={claim.id} className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{claim.item_name} — {claim.item_location}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      Claimed by {claim.claimant_name} — "{claim.evidence_text}"
                    </p>
                  </div>
                  <Link
                    to="/admin/claims"
                    className="shrink-0 border border-border px-3.5 py-1.5 text-xs font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </AsyncState>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Audit log</h2>
            <Link to="/admin/audit-log" className="text-sm font-medium text-fg-muted underline underline-offset-4 hover:text-fg">
              View all
            </Link>
          </div>
          <div className="mt-4 border-t border-border">
            <AsyncState
              loading={audit.loading}
              error={audit.error}
              onRetry={audit.reload}
              isEmpty={audit.data?.items.length === 0}
              emptyText="No admin activity yet."
            >
              {audit.data?.items.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 border-b border-border py-4">
                  <div>
                    <p className="text-sm">{entry.action}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">Admin — {entry.admin_name}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-fg-muted">{timeAgo(entry.created_at)}</span>
                </div>
              ))}
            </AsyncState>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Admin;
