// The API sends UTC timestamps, sometimes without a "Z". Without a zone the browser
// would read them as local time, so assume UTC. Date-only values stay local.
function parseDate(value: string) {
  if (value.length === 10) return new Date(`${value}T00:00:00`);
  const time = value.split("T")[1] ?? "";
  const hasZone = /(z|[+-]\d{2}:?\d{2})$/i.test(time);
  return new Date(hasZone ? value : `${value}Z`);
}

export function formatDate(value: string) {
  const date = parseDate(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string) {
  const time = parseDate(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${formatDate(value)} · ${time}`;
}

export function timeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - parseDate(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function percent(score: number) {
  return `${Math.round(score * 100)}%`;
}
