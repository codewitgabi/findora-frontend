import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/authlayout";
import { errorMessage } from "../lib/api";
import { requestPasswordReset } from "../lib/auth";

const inputClass = "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to send a reset link right now."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout eyebrow="Account recovery" heading="Get back into your account." description="We'll email you a single-use link to choose a new password.">
      <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">Forgot password</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Reset your password</h1>
      {sent ? (
        <p role="status" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">
          If an account exists for {email.trim()}, a reset link is on its way. It expires in 30 minutes. Check your spam folder if it doesn't arrive.
        </p>
      ) : (
        <>
          {error && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Campus email</label>
              <input id="email" type="email" autoComplete="email" placeholder="you@campus.edu" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full border border-fg bg-fg px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </>
      )}
      <p className="mt-6 text-sm text-fg-muted">
        Remembered it? <Link to="/login" className="font-medium text-fg underline underline-offset-4">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
