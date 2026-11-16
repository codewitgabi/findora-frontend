import { Link } from "react-router-dom";

function Cta() {
  return (
    <section id="for-campuses" className="border-t border-border bg-bg-soft">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          For campuses
        </p>
        <h2 className="mx-auto mt-3 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
          Bring AFUSTA-FINDORA to your campus.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-fg-muted">
          Give students and staff a faster, more reliable way to report and
          recover lost property — backed by image search and admin
          verification.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3.5 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
          >
            Create your account
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
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-fg underline underline-offset-4"
          >
            Explore features
          </a>
        </div>
      </div>
    </section>
  );
}

export default Cta;
