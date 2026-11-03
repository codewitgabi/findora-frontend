import { useState, type FormEvent } from "react";
import AppShell from "../components/appshell";
import ActionButton from "../components/actionbutton";
import AsyncState from "../components/asyncstate";
import { errorMessage } from "../lib/api";
import { createCategory, deleteCategory } from "../lib/admin";
import { listCategories } from "../lib/items";
import { useApi } from "../lib/useapi";

function AdminCategories() {
  const { data, error, loading, reload } = useApi(listCategories, "categories");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsAdding(true);
    try {
      await createCategory(name.trim());
      setName("");
      reload();
    } catch (cause) {
      setFormError(errorMessage(cause, "Unable to add that category."));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setFormError("");
    setBusyId(id);
    try {
      await deleteCategory(id);
      reload();
    } catch (cause) {
      setFormError(errorMessage(cause, "Unable to delete that category."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <AppShell variant="admin">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Categories</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Organize item categories</h1>
        <p className="mt-2 text-fg-muted">Categories appear in report forms and search filters.</p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleAdd}>
          <input
            type="text"
            value={name}
            onChange={(event) => { setName(event.target.value); setFormError(""); }}
            placeholder="New category name"
            aria-label="New category name"
            maxLength={60}
            required
            className="flex-1 border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
          />
          <button type="submit" disabled={isAdding} className="border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">
            {isAdding ? "Adding..." : "Add category"}
          </button>
        </form>
        {formError && <p role="alert" className="mt-3 text-sm text-accent">{formError}</p>}

        <div className="mt-8 border-t border-border">
          <AsyncState
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={data?.items.length === 0}
            emptyText="No categories yet."
          >
            {data?.items.map((category) => {
              const count = category.item_count ?? 0;
              return (
                <div key={category.id} className="flex items-center justify-between gap-4 border-b border-border py-4">
                  <div>
                    <p className="text-sm font-semibold">{category.name}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {count} {count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <ActionButton
                    label="Delete"
                    variant="reject"
                    disabled={count > 0 || busyId === category.id}
                    onClick={() => handleDelete(category.id)}
                  />
                </div>
              );
            })}
          </AsyncState>
        </div>
        <p className="mt-4 text-xs text-fg-muted">Categories with items assigned can't be deleted.</p>
      </div>
    </AppShell>
  );
}

export default AdminCategories;
