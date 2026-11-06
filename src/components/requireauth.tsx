import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken, getCurrentUser, isStaff, refreshCurrentUser } from "../lib/auth";

/** `staff` admits admins and lost-property officers; `admin` admits admins only. */
function RequireAuth({ children, role }: { children: ReactNode; role?: "admin" | "staff" }) {
  const location = useLocation();
  const [knownRole, setKnownRole] = useState(getCurrentUser()?.role);
  const hasToken = Boolean(getAccessToken());
  const needsLookup = hasToken && Boolean(role) && !knownRole;

  useEffect(() => {
    if (!needsLookup) return;
    let cancelled = false;
    refreshCurrentUser().then(
      (user) => {
        if (!cancelled) setKnownRole(user.role);
      },
      () => {
        if (!cancelled) setKnownRole("user");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [needsLookup]);

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname }} />;
  }

  if (role) {
    if (needsLookup) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg font-mono text-xs tracking-widest text-fg-muted uppercase">
          Checking access...
        </div>
      );
    }
    const allowed = role === "staff" ? isStaff(knownRole) : knownRole === role;
    if (!allowed) return <Navigate to={isStaff(knownRole) ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

export default RequireAuth;
