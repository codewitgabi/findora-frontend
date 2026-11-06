const labels: Record<string, string> = {
  matched: "Possible match",
  claimed: "Awaiting pickup",
  awaiting_pickup: "Awaiting pickup",
  collected: "Collected",
  closed: "Closed",
  officer: "Officer",
};

function statusClass(status: string) {
  if (["matched", "approved", "claimed", "awaiting_pickup"].includes(status)) return "border-accent text-accent";
  if (["resolved", "rejected", "suspended", "closed", "collected"].includes(status)) return "border-border text-fg-muted";
  return "border-fg text-fg";
}

function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  const label = labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <span
      className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase ${statusClass(key)}`}
    >
      {label}
    </span>
  );
}

export default StatusPill;
