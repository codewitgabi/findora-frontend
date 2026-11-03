import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/authlayout";
import PasswordInput from "../components/passwordinput";
import { ApiError } from "../lib/api";
import { registerUser, storeCurrentUser } from "../lib/auth";

const inputClass = "mt-1.5 w-full border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    try {
      const user = await registerUser({ full_name: fullName, email, password });
      storeCurrentUser({ full_name: user.full_name, email: user.email, role: user.role });
      navigate("/login", { state: { registered: true } });
    }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Unable to create your account."); }
    finally { setIsSubmitting(false); }
  }

  return (
    <AuthLayout eyebrow="Get started" heading="Join your campus's recovery network." description="Report a lost or found item and let image search do the matching for you.">
      <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">Create account</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Register with your campus email</h1>
      {error && <p role="alert" className="mt-6 border border-accent px-4 py-3 text-sm text-accent">{error}</p>}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div><label htmlFor="name" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Full name</label><input id="name" type="text" autoComplete="name" placeholder="Jordan Ade" className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} required /></div>
        <div><label htmlFor="email" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Campus email</label><input id="email" type="email" autoComplete="email" placeholder="you@campus.edu" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div><label htmlFor="password" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Password</label><PasswordInput id="password" autoComplete="new-password" placeholder="Password" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div>
        <div><label htmlFor="confirm-password" className="font-mono text-[10px] tracking-widest text-fg-muted uppercase">Confirm password</label><PasswordInput id="confirm-password" autoComplete="new-password" placeholder="Confirm password" className={inputClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></div>
        <button type="submit" disabled={isSubmitting} className="w-full border border-fg bg-fg px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="mt-6 text-sm text-fg-muted">Already have an account? <Link to="/login" className="font-medium text-fg underline underline-offset-4">Sign in</Link></p>
    </AuthLayout>
  );
}
export default Register;
