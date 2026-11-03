import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import Pagination from "../components/pagination";
import { formatDate, percent } from "../lib/format";
import { listCategories, searchItems, searchItemsByImage, type SearchFilters } from "../lib/items";
import { useApi } from "../lib/useapi";

const maxFileSize = 10 * 1024 * 1024;
const fieldClass =
  "border border-border bg-surface px-3.5 py-2 text-xs text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

function Search() {
  const categories = useApi(listCategories, "categories");
  const [draft, setDraft] = useState<SearchFilters>({});
  const [applied, setApplied] = useState<SearchFilters>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [page, setPage] = useState(1);

  const photoKey = photo ? `${photo.name}:${photo.size}:${photo.lastModified}` : "";
  const results = useApi(
    () => (photo ? searchItemsByImage(photo, applied) : searchItems(applied, page)),
    `search:${JSON.stringify(applied)}:${photoKey}:${page}`,
  );

  function updateDraft(field: keyof SearchFilters, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(draft);
    setPage(1);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > maxFileSize) {
      setPhotoError("Images must be 10MB or smaller.");
      return;
    }
    setPhoto(file);
    setPage(1);
  }

  const isPhotoSearch = photo !== null;
  const total = results.data?.total ?? 0;
  const pageSize = results.data?.page_size ?? 20;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          Search
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Find a matching report
        </h1>
        <p className="mt-2 text-fg-muted">
          Search by keyword or upload a photo to rank visually similar items.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fg-muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, category, or location"
                value={draft.q ?? ""}
                onChange={(event) => updateDraft("q", event.target.value)}
                disabled={isPhotoSearch}
                className="w-full border border-border bg-surface py-3 pr-4 pl-11 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none disabled:opacity-50"
              />
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 border border-border bg-bg-soft px-5 py-3 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              Search by photo
              <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
            </label>
            <button
              type="submit"
              className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <select
              aria-label="Category"
              value={draft.category ?? ""}
              onChange={(event) => updateDraft("category", event.target.value)}
              className={fieldClass}
            >
              <option value="">Any category</option>
              {categories.data?.items.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <select
              aria-label="Report type"
              value={draft.report_type ?? ""}
              onChange={(event) => updateDraft("report_type", event.target.value)}
              className={fieldClass}
            >
              <option value="">Lost &amp; found</option>
              <option value="found">Found only</option>
              <option value="lost">Lost only</option>
            </select>
            <input
              type="text"
              aria-label="Color"
              placeholder="Color"
              value={draft.color ?? ""}
              onChange={(event) => updateDraft("color", event.target.value)}
              className={`${fieldClass} w-28`}
            />
            <input
              type="text"
              aria-label="Location"
              placeholder="Location"
              value={draft.location ?? ""}
              onChange={(event) => updateDraft("location", event.target.value)}
              className={`${fieldClass} w-36`}
            />
            <input
              type="date"
              aria-label="From date"
              value={draft.date_from ?? ""}
              onChange={(event) => updateDraft("date_from", event.target.value)}
              className={fieldClass}
            />
            <input
              type="date"
              aria-label="To date"
              value={draft.date_to ?? ""}
              onChange={(event) => updateDraft("date_to", event.target.value)}
              className={fieldClass}
            />
          </div>
        </form>

        {photoError && <p role="alert" className="mt-4 text-sm text-accent">{photoError}</p>}
        {photo && (
          <div className="mt-4 flex items-center justify-between gap-4 border border-accent px-4 py-2.5 text-sm">
            <span className="min-w-0 truncate text-accent">Searching by photo: {photo.name}</span>
            <button
              type="button"
              onClick={() => { setPhoto(null); setPage(1); }}
              className="shrink-0 text-xs font-semibold text-fg-muted underline underline-offset-4 hover:text-fg"
            >
              Clear photo
            </button>
          </div>
        )}

        <div className="mt-10">
          <AsyncState
            loading={results.loading}
            error={results.error}
            onRetry={results.reload}
            isEmpty={results.data?.items.length === 0}
            emptyText="No matching items found. Try fewer filters or a different photo."
          >
            <p className="text-sm text-fg-muted">
              {total} {isPhotoSearch ? "possible matches, ranked by similarity" : total === 1 ? "result" : "results"}
            </p>

            <div className="mt-4 border-t border-border">
              {results.data?.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className="flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-bg-soft"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-border bg-bg-soft text-fg-muted">
                    {item.photo ? (
                      <img src={item.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-5 w-5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.item_name}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {item.report_type === "lost" ? "Lost" : "Found"} · {item.location} · {formatDate(item.date)}
                    </p>
                  </div>
                  {item.score !== null && (
                    <span className="shrink-0 border border-accent px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                      {percent(item.score)}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {!isPhotoSearch && <Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} />}
          </AsyncState>
        </div>
      </div>
    </AppShell>
  );
}

export default Search;
