import { Link } from "react-router-dom";
import { useTypewriter } from "../lib/usetypewriter";

const avatars = [
  { initials: "AM", bg: "#f5c396" },
  { initials: "TJ", bg: "#c9d6f5" },
  { initials: "RS", bg: "#f5b8c4" },
  { initials: "KO", bg: "#bfe3c9" },
];

const dynamicPhrases = [
  "Find it with a photo.",
  "Match it to campus reports.",
  "Get it back, fast.",
];

function Hero() {
  const typed = useTypewriter(dynamicPhrases);

  return (
    <section className="bg-bg py-20 text-center sm:py-28 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface py-1.5 pr-4 pl-1.5 text-sm">
          <div className="flex -space-x-2">
            {avatars.map((avatar) => (
              <span
                key={avatar.initials}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-black/70"
                style={{ backgroundColor: avatar.bg }}
              >
                {avatar.initials}
              </span>
            ))}
          </div>
          <span className="h-4 w-px bg-border" />
          <span className="text-fg-muted">
            Trusted by <span className="font-semibold text-fg">40+</span>{" "}
            campus security teams
          </span>
        </div>

        <h1 className="mx-auto mt-8 max-w-3xl text-5xl leading-[1.05] font-bold tracking-tight text-balance text-fg sm:text-6xl lg:text-7xl">
          Lost something on campus?
          <br />
          <span className="text-accent">
            {typed}
            <span
              aria-hidden="true"
              className="animate-caret ml-1 inline-block h-[0.85em] w-1.5 translate-y-[0.12em] bg-accent align-middle"
            />
          </span>
          <span className="sr-only">Find it with a photo.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-fg-muted">
          Report a lost or found item, upload a photo, and let image search
          surface possible matches automatically.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-accent"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Powered by{" "}
            <span className="font-semibold text-fg">image search</span>
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-accent"
            >
              <path d="M12 22c5-1.5 8-5.5 8-10V5l-8-3-8 3v7c0 4.5 3 8.5 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Backed by{" "}
            <span className="font-semibold text-fg">verified claims</span>
          </span>
        </div>

        <div className="mt-10">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3.5 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
          >
            Get started
            <span className="font-normal text-bg/60">· It's free</span>
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
        </div>
      </div>
    </section>
  );
}

export default Hero;
