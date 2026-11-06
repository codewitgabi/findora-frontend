import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/authlayout";
import PasswordInput from "../components/passwordinput";
import { ApiError, errorMessage } from "../lib/api";
import { logoutUser, resetPassword } from "../lib/auth";

const inputClass = "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [linkInvalid, setLinkInvalid] = useState(!token);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      // Every session was signed out by the reset; clear this device too.
      logoutUser();
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (cause) {
      if (cause instanceof ApiError && cause.fieldErrors.some((field) => field.field === "token")) {
        setLinkInvalid(true);
      } else {
        setError(errorMessage(cause, "Unable to reset your password."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout eyebrow="Account recovery" heading="Choose a new password." description="Resetting your password signs you out on every device.">
      <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">Reset password</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Set a new password</h1>
      {linkInvalid ? (
        <>
          <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">
            This reset link is invalid or has expired. Links work once and only for 30 minutes.
          </p>
          <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-fg underline underline-offset-4">
            Request a new link
          </Link>
        </>
      ) : (
        <>
          {error && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">New password</label>
              <PasswordInput id="password" autoComplete="new-password" placeholder="At least 8 characters" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            </div>
            <div>
              <label htmlFor="confirm-password" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Confirm password</label>
              <PasswordInput id="confirm-password" autoComplete="new-password" placeholder="Confirm password" className={inputClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full border border-fg bg-fg px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Saving..." : "Save new password"}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

export default ResetPassword;
