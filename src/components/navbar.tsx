import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import FeaturesMenu from "./featuresmenu";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For campuses", href: "#for-campuses" },
];

function Navbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimeout = useRef<number | undefined>(undefined);

  function openFeatures() {
    window.clearTimeout(closeTimeout.current);
    setFeaturesOpen(true);
  }

  function scheduleCloseFeatures() {
    closeTimeout.current = window.setTimeout(() => setFeaturesOpen(false), 120);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-7xl items-stretch px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2 pr-4 sm:pr-6">
          <span className="flex h-7 w-7 items-center justify-center border border-fg bg-fg text-bg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <span className="font-mono text-sm font-bold uppercase tracking-widest">
            Findora
          </span>
        </a>

        <nav className="hidden items-stretch border-l border-border pl-4 sm:pl-6 md:flex">
          <div
            className="flex items-center"
            onMouseEnter={openFeatures}
            onMouseLeave={scheduleCloseFeatures}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
              aria-expanded={featuresOpen}
            >
              Features
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-3.5 w-3.5 transition-transform ${featuresOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {featuresOpen && <FeaturesMenu onNavigate={() => setFeaturesOpen(false)} />}
          </div>

          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="ml-8 flex items-center text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="border border-fg bg-fg px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
          >
            Get started
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center border border-border text-fg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-bg px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Features
            </a>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="border border-fg bg-fg px-4 py-2 text-center text-sm font-semibold text-bg"
            >
              Get started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
