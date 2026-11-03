import { useState, type FormEvent } from "react";
import AppShell from "../components/appshell";
import AsyncState from "../components/asyncstate";
import PasswordInput from "../components/passwordinput";
import { ApiError, errorMessage } from "../lib/api";
import { getCurrentUser, refreshCurrentUser, storeCurrentUser, type RegisteredUser } from "../lib/auth";
import { changePassword, updateProfile } from "../lib/me";
import { useApi } from "../lib/useapi";

const inputClass =
  "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";
const passwordClass =
  "w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">
      {children}
    </label>
  );
}

function DetailsForm({ me }: { me: RegisteredUser }) {
  const [fullName, setFullName] = useState(me.full_name);
  const [phone, setPhone] = useState(me.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setIsSaving(true);
    try {
      const trimmedPhone = phone.trim();
      const updated = await updateProfile({
        full_name: fullName.trim(),
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      });
      const current = getCurrentUser();
      storeCurrentUser({ ...current, email: updated.email, full_name: updated.full_name, phone: updated.phone, role: updated.role });
      setSaved(true);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to save your changes."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="mt-8 space-y-5 border-t border-border py-8" onSubmit={handleSave}>
      <h2 className="text-lg font-semibold">Personal details</h2>
      {saved && <p role="status" className="border border-accent px-4 py-3 text-sm text-accent">Profile updated.</p>}
      {error && <p role="alert" className="border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
      <div>
        <FieldLabel htmlFor="full-name">Full name</FieldLabel>
        <input id="full-name" type="text" className={inputClass} value={fullName} onChange={(event) => { setFullName(event.target.value); setSaved(false); }} maxLength={120} required />
      </div>
      <div>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input id="email" type="email" className={`${inputClass} cursor-not-allowed opacity-60`} value={me.email} readOnly />
      </div>
      <div>
        <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
        <input id="phone" type="tel" placeholder="e.g. 0801 234 5678" className={inputClass} value={phone} onChange={(event) => { setPhone(event.target.value); setSaved(false); }} />
        <p className="mt-1.5 text-xs text-fg-muted">Only shared with an administrator when a claim is approved.</p>
      </div>
      <button type="submit" disabled={isSaving} className="w-full border border-fg bg-fg px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8">
        {isSaving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentError, setCurrentError] = useState("");
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCurrentError("");
    setChanged(false);
    setIsSaving(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setChanged(true);
    } catch (cause) {
      const fieldError = cause instanceof ApiError ? cause.fieldErrors.find((entry) => entry.field === "current_password") : undefined;
      if (fieldError) setCurrentError(fieldError.message);
      else setError(errorMessage(cause, "Unable to update your password."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-5 border-t border-border py-8" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold">Change password</h2>
      {changed && <p role="status" className="border border-accent px-4 py-3 text-sm text-accent">Password updated.</p>}
      {error && <p role="alert" className="border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
      <div>
        <FieldLabel htmlFor="current-password">Current password</FieldLabel>
        <PasswordInput id="current-password" name="current_password" autoComplete="current-password" className={passwordClass} value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); setCurrentError(""); }} required />
        {currentError && <p role="alert" className="mt-1.5 text-xs text-accent">{currentError}</p>}
      </div>
      <div>
        <FieldLabel htmlFor="new-password">New password</FieldLabel>
        <PasswordInput id="new-password" name="new_password" autoComplete="new-password" className={passwordClass} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} required />
      </div>
      <button type="submit" disabled={isSaving} className="w-full border border-border px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8">
        {isSaving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

function Profile() {
  const me = useApi(refreshCurrentUser, "me");

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Your account</h1>

        <AsyncState loading={me.loading} error={me.error} onRetry={me.reload}>
          {me.data && (
            <>
              <DetailsForm me={me.data} />
              <PasswordForm />
            </>
          )}
        </AsyncState>
      </div>
    </AppShell>
  );
}

export default Profile;
