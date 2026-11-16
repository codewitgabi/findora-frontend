import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-accent"
    >
      {children}
    </svg>
  );
}

const features = [
  {
    title: "Image-based search",
    description:
      "Upload a photo of a lost or found item and let visual matching surface likely candidates from the campus database.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
  },
  {
    title: "Centralized reporting",
    description:
      "One structured form for lost and found reports replaces scattered notice boards and group chats.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </>
    ),
  },
  {
    title: "Smart filters",
    description:
      "Combine category, color, location, and date with visual similarity for ranked, relevant results.",
    icon: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
  },
  {
    title: "Claim verification",
    description:
      "Users submit evidence before a claim is approved, so items only reach their rightful owner.",
    icon: (
      <>
        <path d="M12 22c5-1.5 8-5.5 8-10V5l-8-3-8 3v7c0 4.5 3 8.5 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Instant notifications",
    description:
      "Get alerted the moment a possible match, claim decision, or status change happens on your report.",
    icon: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
  },
  {
    title: "Admin oversight",
    description:
      "Campus staff review reports, verify claims, and track every action with a full audit log.",
    icon: (
      <>
        <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z" />
      </>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Everything a campus needs, in one system.
          </h2>
          <p className="mt-4 text-lg text-fg-muted">
            AFUSTA-FINDORA pairs structured reporting with visual search so matches
            surface faster — and a controlled claim process keeps recovery
            honest.
          </p>
        </div>

        <div className="mt-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 border-t border-border py-8 first:border-t-0 sm:flex-row sm:items-start sm:gap-10 lg:py-10"
            >
              <div className="flex items-center gap-3 sm:w-72 sm:shrink-0">
                <span className="font-mono text-sm text-fg-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon>{feature.icon}</Icon>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-fg-muted sm:flex-1">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
