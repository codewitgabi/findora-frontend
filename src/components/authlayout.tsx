import type { ReactNode } from "react";
import Logo from "./logo";

const bullets = [
  "Image-based search",
  "Verified claims",
  "Admin oversight",
];

function AuthLayout({
  eyebrow,
  heading,
  description,
  children,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-bg-soft p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-4 max-w-sm text-4xl font-bold tracking-tight">
            {heading}
          </h2>
          <p className="mt-4 max-w-sm text-fg-muted">{description}</p>
          <ul className="mt-8 space-y-3">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-3 text-sm text-fg-muted"
              >
                <span className="h-1.5 w-1.5 bg-accent" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-fg-muted">
          AFUSTA-FINDORA / CAMPUS LOST &amp; FOUND
        </p>
      </div>

      <div className="flex flex-col">
        <div className="border-b border-border p-6 lg:hidden">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
