import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/authlayout";
import PasswordInput from "../components/passwordinput";
import { ApiError } from "../lib/api";
import { loginUser } from "../lib/auth";

const inputClass = "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginState = location.state as { registered?: boolean; returnTo?: string; passwordReset?: boolean } | null;
  const registered = loginState?.registered;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try { await loginUser({ email, password }); navigate(loginState?.returnTo ?? "/dashboard", { replace: true }); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Unable to sign in."); }
    finally { setIsSubmitting(false); }
  }

  return (
    <AuthLayout eyebrow="Welcome back" heading="Sign in to keep campus recovery moving." description="Track your reports, review matches, and manage claims from one place.">
      <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">Sign in</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Access your account</h1>
      {registered && <p className="mt-6 border border-accent px-4 py-3 text-sm text-accent">Account created. Sign in to continue.</p>}
      {loginState?.passwordReset && <p className="mt-6 border border-accent px-4 py-3 text-sm text-accent">Password updated. Sign in with your new password.</p>}
      {error && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Campus email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@campus.edu" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Password</label>
            <Link to="/forgot-password" className="text-xs text-fg-muted underline underline-offset-4 hover:text-fg">Forgot password?</Link>
          </div>
          <PasswordInput id="password" autoComplete="current-password" placeholder="Password" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full border border-fg bg-fg px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="mt-6 text-sm text-fg-muted">Don't have an account? <Link to="/register" className="font-medium text-fg underline underline-offset-4">Create one</Link></p>
    </AuthLayout>
  );
}
export default Login;
