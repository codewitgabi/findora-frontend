import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/appshell";
import { listCategories } from "../lib/items";
import { useApi } from "../lib/useapi";
import { ApiError, errorMessage } from "../lib/api";
import { createLostItem, uploadLostItemImage } from "../lib/lost-items";

const inputClass =
  "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";
const maxFileSize = 10 * 1024 * 1024;

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">
      {children}
    </label>
  );
}

function Report() {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const categories = useApi(listCategories, "categories");
  const [chosenCategory, setCategory] = useState("");
  const category = chosenCategory || categories.data?.items[0]?.name || "";
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectPhoto(file: File | null) {
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    if (!file) {
      selectPhoto(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      selectPhoto(null);
      setError("Please choose an image file.");
      return;
    }
    if (file.size > maxFileSize) {
      selectPhoto(null);
      setError("Images must be 10MB or smaller.");
      return;
    }
    selectPhoto(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!photo) {
      setError("Please add a photo of the lost item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImage = await uploadLostItemImage(photo);
      await createLostItem({
        item_name: itemName,
        category,
        color,
        description,
        photo: uploadedImage.url,
        last_seen_location: location,
        date_lost: dateLost,
      });
      navigate("/dashboard", { state: { submitted: "lost" } });
    } catch (cause) {
      if (cause instanceof ApiError && cause.statusCode === 401) {
        navigate("/login", { state: { returnTo: "/report" } });
        return;
      }
      setError(errorMessage(cause, "Unable to submit your report."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Report a lost item</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Tell us what happened</h1>
        <p className="mt-2 text-fg-muted">The more detail you add, the better image search can match it.</p>

        {error && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{error}</p>}

        <form className="mt-8 divide-y divide-border border-t border-border" onSubmit={handleSubmit}>
          <section className="space-y-5 py-8">
            <h2 className="text-lg font-semibold">Item details</h2>
            <div>
              <FieldLabel htmlFor="item-name">Item name</FieldLabel>
              <input id="item-name" type="text" placeholder="e.g. Black backpack" className={inputClass} value={itemName} onChange={(event) => setItemName(event.target.value)} minLength={1} maxLength={120} required />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <select id="category" className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)} required>
                  <option value="Bags">Bags</option>
                  <option value="Electronics">Electronics</option>
                  <option value="ID cards & documents">ID cards &amp; documents</option>
                  <option value="Keys">Keys</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="color">Color</FieldLabel>
                <input id="color" type="text" placeholder="e.g. Black" className={inputClass} value={color} onChange={(event) => setColor(event.target.value)} maxLength={50} required />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="description">Description &amp; identifying marks</FieldLabel>
              <textarea id="description" rows={4} placeholder="Brand, stickers, scratches, contents — anything that helps confirm ownership." className={`${inputClass} resize-none`} value={description} onChange={(event) => setDescription(event.target.value)} minLength={1} maxLength={2000} required />
            </div>
          </section>

          <section className="space-y-5 py-8">
            <h2 className="text-lg font-semibold">Photo</h2>
            <label htmlFor="photo" className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-bg-soft px-4 py-10 text-center transition-colors hover:border-accent">
              {preview ? (
                <img src={preview} alt="Preview of the selected photo" className="max-h-64 w-auto max-w-full border border-border object-contain" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-fg-muted" aria-hidden="true">
                  <path d="M12 16V4M12 4 7 9M12 4l5 5" />
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
              )}
              <p className="text-sm text-fg-muted">{photo ? <>{photo.name} · <span className="font-medium text-fg underline underline-offset-4">Replace</span></> : <>Drag a photo here or <span className="font-medium text-fg underline underline-offset-4">browse</span></>}</p>
              <p className="text-xs text-fg-muted">PNG or JPG, up to 10MB</p>
              <input id="photo" type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} required />
            </label>
          </section>

          <section className="space-y-5 py-8">
            <h2 className="text-lg font-semibold">Location &amp; date</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="location">Last seen near</FieldLabel>
                <input id="location" type="text" placeholder="e.g. Main Library, second floor" className={inputClass} value={location} onChange={(event) => setLocation(event.target.value)} maxLength={255} required />
              </div>
              <div>
                <FieldLabel htmlFor="date">Date lost</FieldLabel>
                <input id="date" type="date" className={inputClass} value={dateLost} onChange={(event) => setDateLost(event.target.value)} required />
              </div>
            </div>
          </section>

          <div className="py-8">
            <button type="submit" disabled={isSubmitting} className="w-full border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8">
              {isSubmitting ? "Submitting report..." : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default Report;
