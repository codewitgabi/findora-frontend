const items = [
  {
    label: "Image search",
    description: "Upload a photo and rank visually similar reports.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
  },
  {
    label: "Claims",
    description: "Evidence-backed requests before an item changes hands.",
    icon: (
      <>
        <path d="M12 22c5-1.5 8-5.5 8-10V5l-8-3-8 3v7c0 4.5 3 8.5 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    label: "Notifications",
    description: "Alerts the moment a likely match turns up.",
    icon: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
  },
  {
    label: "Admin console",
    description: "Review reports, verify claims, audit every action.",
    icon: (
      <>
        <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z" />
      </>
    ),
  },
];

function FeaturesMenu() {
  return (
    <div className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[220px_1fr] lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-fg-muted">
            All features
          </p>
          <h3 className="mt-3 text-xl font-semibold text-balance">
            Built for how campuses actually recover items.
          </h3>
        </div>

        <div>
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {items.map((item) => (
              <a
                key={item.label}
                href="#features"
                className="group flex flex-col gap-3 bg-surface p-5 transition-colors hover:bg-bg-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-accent"
                    >
                      {item.icon}
                    </svg>
                    {item.label}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
                <p className="text-sm text-fg-muted">{item.description}</p>
              </a>
            ))}
          </div>

          <a
            href="#features"
            className="mt-px flex items-center justify-between border border-t-0 border-border bg-surface px-5 py-4 text-sm font-medium transition-colors hover:bg-bg-soft"
          >
            View all features
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm sm:px-6 lg:px-8">
          <a href="#get-started" className="font-medium text-accent">
            Get started →
          </a>
          <span className="font-mono text-xs text-fg-muted">
            findora / campus lost &amp; found
          </span>
        </div>
      </div>
    </div>
  );
}

export default FeaturesMenu;
