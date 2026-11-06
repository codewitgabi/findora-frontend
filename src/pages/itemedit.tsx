import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import { errorMessage } from "../lib/api";
import { FINDER_KEEPS_IT, HANDED_TO_OPTIONS, uploadFoundItemImage } from "../lib/found-items";
import { OPEN_STATUSES } from "../lib/me";
import { categoryNames, getItem, listCategories, updateItem, type ItemDetail, type ItemUpdate } from "../lib/items";
import { uploadLostItemImage } from "../lib/lost-items";
import { useApi } from "../lib/useapi";

const inputClass =
  "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CONDITIONS = ["Good", "Used", "Damaged"];
// Changing anything else on an approved report sends it back for review.
const REVIEW_FREE: (keyof ItemUpdate)[] = ["handed_to", "condition", "identifying_marks"];

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">{label}</label>
      {children}
    </div>
  );
}

type Draft = Required<Omit<ItemUpdate, "photo" | "identifying_marks">> & { identifying_marks: string };

function draftFrom(item: ItemDetail): Draft {
  return {
    item_name: item.item_name,
    category: item.category,
    color: item.color,
    description: item.description,
    location: item.location,
    date: item.date,
    identifying_marks: item.identifying_marks ?? "",
    condition: item.condition ?? "Good",
    handed_to: item.handed_to ?? FINDER_KEEPS_IT,
  };
}

function EditForm({ item }: { item: ItemDetail }) {
  const navigate = useNavigate();
  const categories = useApi(listCategories, "categories");
  const [draft, setDraft] = useState<Draft>(() => draftFrom(item));
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isLost = item.report_type === "lost";
  const original = draftFrom(item);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    if (file && file.size > MAX_FILE_SIZE) {
      setError("Images must be 10MB or smaller.");
      return;
    }
    setNewPhoto(file);
    setRemovePhoto(false);
  }

  const changes: ItemUpdate = {};
  for (const key of Object.keys(draft) as (keyof Draft)[]) {
    if (!isLost && key === "identifying_marks") continue;
    if (isLost && (key === "condition" || key === "handed_to")) continue;
    if (draft[key] !== original[key]) {
      (changes as Record<string, string | null>)[key] = key === "identifying_marks" ? draft[key].trim() || null : draft[key];
    }
  }
  const photoChanged = Boolean(newPhoto) || removePhoto;
  const hasChanges = photoChanged || Object.keys(changes).length > 0;
  const needsReview =
    item.status !== "pending" &&
    (photoChanged || Object.keys(changes).some((key) => !REVIEW_FREE.includes(key as keyof ItemUpdate)));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasChanges) return;
    setError("");
    setSaving(true);
    try {
      const body: ItemUpdate = { ...changes };
      if (newPhoto) {
        const upload = isLost ? await uploadLostItemImage(newPhoto) : await uploadFoundItemImage(newPhoto);
        body.photo = upload.url;
      } else if (removePhoto) {
        body.photo = null;
      }
      await updateItem(item.id, body);
      navigate(`/items/${item.id}`);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to save your changes."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {error && <p role="alert" className="border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
      <Field id="item-name" label="Item name">
        <input id="item-name" className={inputClass} value={draft.item_name} onChange={(e) => set("item_name", e.target.value)} maxLength={120} required />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="category" label="Category">
          <select id="category" className={inputClass} value={draft.category} onChange={(e) => set("category", e.target.value)} required>
            {/* Keeps the report's current category selectable even if it was removed. */}
            {categoryNames(categories.data, original.category).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </Field>
        <Field id="color" label="Color">
          <input id="color" className={inputClass} value={draft.color} onChange={(e) => set("color", e.target.value)} maxLength={50} required />
        </Field>
      </div>
      <Field id="description" label="Description">
        <textarea id="description" rows={4} className={`${inputClass} resize-none`} value={draft.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} required />
      </Field>
      {isLost && (
        <Field id="identifying-marks" label="Identifying marks (private)">
          <textarea id="identifying-marks" rows={2} className={`${inputClass} resize-none`} value={draft.identifying_marks} onChange={(e) => set("identifying_marks", e.target.value)} maxLength={500} placeholder="Only you and campus staff see this." />
        </Field>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="location" label={isLost ? "Last seen near" : "Found at"}>
          <input id="location" className={inputClass} value={draft.location} onChange={(e) => set("location", e.target.value)} maxLength={255} required />
        </Field>
        <Field id="date" label={isLost ? "Date lost" : "Date found"}>
          <input id="date" type="date" className={inputClass} value={draft.date} onChange={(e) => set("date", e.target.value)} required />
        </Field>
      </div>
      {!isLost && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="condition" label="Condition">
            <select id="condition" className={inputClass} value={draft.condition} onChange={(e) => set("condition", e.target.value)}>
              {CONDITIONS.map((value) => <option key={value}>{value}</option>)}
            </select>
          </Field>
          <Field id="handed-to" label="Where is it now?">
            <select id="handed-to" className={inputClass} value={draft.handed_to} onChange={(e) => set("handed_to", e.target.value)}>
              {HANDED_TO_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
        </div>
      )}

      <div>
        <p className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Photo</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {item.photo && !removePhoto && !newPhoto && <img src={item.photo} alt="" className="h-20 w-20 border border-border object-cover" />}
          <label className="cursor-pointer border border-border px-4 py-2 text-sm hover:border-accent">
            {newPhoto ? `New: ${newPhoto.name}` : item.photo ? "Replace photo" : "Add a photo"}
            <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={handlePhoto} />
          </label>
          {isLost && item.photo && !newPhoto && (
            <label className="flex items-center gap-2 text-sm text-fg-muted">
              <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
              Remove photo
            </label>
          )}
        </div>
      </div>

      {needsReview && (
        <p className="border border-border px-4 py-3 text-sm text-fg-muted">
          Changing these details sends your report back for admin review. It leaves search until it's approved again, and
          its current possible matches are reset.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !hasChanges}
          className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <Link to={`/items/${item.id}`} className="px-4 py-3 text-sm text-fg-muted hover:text-fg">Cancel</Link>
      </div>
    </form>
  );
}

function ItemEdit() {
  const { id = "" } = useParams();
  const { data: item, error, loading, reload } = useApi(() => getItem(id), `item-edit:${id}`);
  const editable = item && item.is_owner && OPEN_STATUSES.includes(item.status);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to={`/items/${id}`} className="text-sm font-medium text-fg-muted hover:text-fg">← Back to report</Link>
        <p className="mt-6 font-mono text-xs tracking-widest text-accent uppercase">Edit report</p>
        <AsyncState loading={loading} error={error} onRetry={reload}>
          {item && (
            <>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{item.item_name}</h1>
              {editable ? (
                <EditForm item={item} />
              ) : (
                <p className="mt-6 text-sm text-fg-muted">
                  {item.is_owner ? `A ${item.status} report can no longer be edited.` : "You can only edit your own reports."}
                </p>
              )}
            </>
          )}
        </AsyncState>
      </div>
    </AppShell>
  );
}

export default ItemEdit;
