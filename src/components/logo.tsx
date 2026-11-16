import { Link } from "react-router-dom";

function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2">
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
      <span className="font-mono text-sm font-bold tracking-wider whitespace-nowrap uppercase sm:tracking-widest">
        AFUSTA-FINDORA
      </span>
    </Link>
  );
}

export default Logo;
