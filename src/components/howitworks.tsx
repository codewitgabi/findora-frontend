import { useEffect, useRef, useState, type ReactNode } from "react";

function BrowserFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-md border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full border border-border" />
        <span className="h-2.5 w-2.5 rounded-full border border-border" />
        <span className="h-2.5 w-2.5 rounded-full border border-border" />
        <span className="ml-2 font-mono text-xs text-fg-muted">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ReportMockup() {
  return (
    <BrowserFrame label="report-item.afusta-findora.app">
      <div className="space-y-3">
        {[
          { label: "Item name", value: "Black backpack" },
          { label: "Category", value: "Bags & backpacks" },
          { label: "Location", value: "Library Annex" },
        ].map((field) => (
          <div key={field.label}>
            <p className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">
              {field.label}
            </p>
            <p className="mt-1 border border-border bg-bg-soft px-3 py-2 text-sm">
              {field.value}
            </p>
          </div>
        ))}
        <div className="border border-accent bg-accent px-3 py-2 text-center text-sm font-semibold text-accent-contrast">
          Submit report
        </div>
      </div>
    </BrowserFrame>
  );
}

function UploadMockup() {
  return (
    <BrowserFrame label="upload photo">
      <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-bg-soft px-4 py-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-fg-muted"
        >
          <path d="M12 16V4M12 4 7 9M12 4l5 5" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <p className="text-sm text-fg-muted">Drag a photo here or browse</p>
      </div>
      <div className="mt-4 flex items-center gap-3 border border-border px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-bg-soft">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-4 w-4 text-fg-muted"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">backpack.jpg</p>
          <div className="mt-1.5 h-1 w-full bg-bg-soft">
            <div className="h-1 w-full bg-accent" />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function MatchesMockup() {
  return (
    <BrowserFrame label="search results">
      <ul className="space-y-2">
        {[
          { label: "Black backpack — Library Annex", score: "96%" },
          { label: "Black backpack — Cafeteria", score: "88%" },
          { label: "Grey backpack — Hostel B", score: "61%" },
        ].map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between border border-border bg-bg-soft px-3 py-2.5"
          >
            <span className="text-sm">{item.label}</span>
            <span className="font-mono text-xs font-semibold text-accent">
              {item.score}
            </span>
          </li>
        ))}
      </ul>
    </BrowserFrame>
  );
}

function ClaimMockup() {
  const checklist = [
    { label: "Claim submitted", state: "done" },
    { label: "Evidence reviewed", state: "done" },
    { label: "Owner verified", state: "active" },
    { label: "Item handed over", state: "pending" },
  ] as const;

  return (
    <BrowserFrame label="claim #4821">
      <ul className="space-y-3">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] ${
                item.state === "done"
                  ? "border-accent bg-accent text-accent-contrast"
                  : item.state === "active"
                    ? "border-accent text-accent"
                    : "border-border text-fg-muted"
              }`}
            >
              {item.state === "done" ? "✓" : item.state === "active" ? "…" : ""}
            </span>
            <span
              className={`text-sm ${
                item.state === "pending" ? "text-fg-muted" : "text-fg"
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </BrowserFrame>
  );
}

const steps = [
  {
    step: "01",
    title: "Report the item",
    description:
      "Log in and fill a short form — item name, category, color, location, and date — for a lost or found item.",
    mockup: ReportMockup,
  },
  {
    step: "02",
    title: "Upload a photo",
    description:
      "Add a clear image if you have one. AFUSTA-FINDORA extracts its visual features for matching.",
    mockup: UploadMockup,
  },
  {
    step: "03",
    title: "Review the matches",
    description:
      "The system ranks visually and descriptively similar items so you can review the most likely ones first.",
    mockup: MatchesMockup,
  },
  {
    step: "04",
    title: "Claim and verify",
    description:
      "Submit a claim with supporting evidence. An administrator verifies ownership before handover.",
    mockup: ClaimMockup,
  },
];

function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          setActiveIndex(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            From lost to found in four moves.
          </h2>
          <p className="mt-4 text-lg text-fg-muted">
            A simple, guided workflow keeps reporting fast and recovery
            trustworthy.
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="relative">
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-4 w-px bg-border"
            />
            <div
              aria-hidden
              className="absolute top-2 left-4 w-px bg-accent transition-all duration-500 ease-out"
              style={{
                height: `${(activeIndex / (steps.length - 1)) * 100}%`,
              }}
            />

            <div className="space-y-[40vh] py-[10vh] lg:space-y-[60vh] lg:py-[20vh]">
              {steps.map((item, index) => {
                const Mockup = item.mockup;
                const isActive = index === activeIndex;

                return (
                  <div
                    key={item.step}
                    ref={(el) => {
                      stepRefs.current[index] = el;
                    }}
                    data-index={index}
                    className="relative pl-14"
                  >
                    <span
                      className={`absolute top-0 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-bold transition-colors duration-300 ${
                        isActive
                          ? "border-accent bg-accent text-accent-contrast"
                          : index < activeIndex
                            ? "border-accent text-accent"
                            : "border-border bg-bg text-fg-muted"
                      }`}
                    >
                      {item.step}
                    </span>
                    <h3
                      className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                        isActive ? "text-fg" : "text-fg-muted"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-fg-muted">
                      {item.description}
                    </p>
                    <div className="mt-6 flex lg:hidden">
                      <Mockup />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="relative overflow-hidden border border-border bg-bg-soft px-8 py-12">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-10 -right-4 font-mono text-[9rem] leading-none font-bold text-fg/[0.04] transition-all duration-500 select-none"
                >
                  {steps[activeIndex].step}
                </span>

                <div className="relative flex justify-center">
                  <div className="relative h-[380px] w-full max-w-sm">
                    {steps.map((item, index) => {
                      const Mockup = item.mockup;
                      const offset = index - activeIndex;
                      return (
                        <div
                          key={item.step}
                          className="absolute inset-0 flex justify-center transition-all duration-500 ease-out"
                          style={{
                            opacity: offset === 0 ? 1 : 0,
                            transform:
                              offset === 0
                                ? "translateY(0) scale(1)"
                                : `translateY(${offset > 0 ? 24 : -24}px) scale(0.96)`,
                            pointerEvents: offset === 0 ? "auto" : "none",
                          }}
                        >
                          <Mockup />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative mt-10 flex items-center justify-center gap-2">
                  {steps.map((item, index) => (
                    <span
                      key={item.step}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeIndex
                          ? "w-6 bg-accent"
                          : "w-1.5 bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
