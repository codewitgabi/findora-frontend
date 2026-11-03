import { Link } from "react-router-dom";
import Logo from "../components/logo";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center text-fg">
      <Logo to="/" />
      <p className="mt-12 font-mono text-xs tracking-widest text-accent uppercase">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">This page has gone missing</h1>
      <p className="mt-2 max-w-sm text-fg-muted">
        The link may be broken or the page may have moved. Let's get you back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/dashboard" className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85">
          Go to dashboard
        </Link>
        <Link to="/search" className="border border-border px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent">
          Search items
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
