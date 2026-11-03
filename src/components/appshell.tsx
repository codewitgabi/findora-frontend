import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./logo";
import { getCurrentUser, logoutUser } from "../lib/auth";
import { listNotifications, NOTIFICATIONS_CHANGED } from "../lib/me";

const NOTIFICATION_POLL_MS = 60_000;

const userLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Report item", href: "/report" },
  { label: "Search", href: "/search" },
  { label: "My claims", href: "/claims" },
  { label: "Notifications", href: "/notifications" },
];

const adminLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Claims", href: "/admin/claims" },
  { label: "Users", href: "/admin/users" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Audit log", href: "/admin/audit-log" },
  { label: "Back to app", href: "/dashboard" },
];

function AppShell({
  children,
  variant = "user",
}: {
  children: ReactNode;
  variant?: "user" | "admin";
}) {
  const user = getCurrentUser();
  const links =
    variant === "admin"
      ? adminLinks
      : user?.role === "admin"
        ? [...userLinks, { label: "Admin", href: "/admin" }]
        : userLinks;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (variant !== "user") return;
    let cancelled = false;
    const refresh = () => {
      listNotifications(1, 1).then(
        (page) => {
          if (!cancelled) setUnreadCount(page.unread_count);
        },
        () => {},
      );
    };
    refresh();
    const timer = window.setInterval(refresh, NOTIFICATION_POLL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
    };
  }, [variant]);

  const displayName = user?.full_name?.trim() || user?.email.split("@")[0] || "Account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo to={variant === "admin" ? "/admin" : "/dashboard"} />
            {variant === "admin" && (
              <span className="border border-accent px-2 py-0.5 font-mono text-[10px] tracking-widest text-accent uppercase">
                Admin
              </span>
            )}
          </div>

          <nav className="hidden items-center gap-6 sm:flex">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/admin"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {variant === "user" && (
              <NavLink
                to="/notifications"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent"
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
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </NavLink>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              {user?.email && <p className="text-xs text-fg-muted">{user.email}</p>}
            </div>
            <NavLink
              to="/profile"
              title="Profile"
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center border border-border bg-bg-soft font-mono text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              {initials}
            </NavLink>
            <button
              type="button"
              onClick={() => {
                logoutUser();
                window.location.href = "/login";
              }}
              className="text-xs text-fg-muted transition-colors hover:text-fg"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default AppShell;
