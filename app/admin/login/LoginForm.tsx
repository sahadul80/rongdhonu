"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { validateLoginForm } from "@/lib/formValidation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(emailValue: string, passwordValue: string) {
    setError(null);
    const validation = validateLoginForm(emailValue, passwordValue);
    if (!validation.ok) return setError(validation.message);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: emailValue.trim(), password: passwordValue }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Sign-in failed.");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally { setLoading(false); }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void signIn(email, password);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-7">
        <div className="mb-6"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><LogIn className="h-5 w-5" aria-hidden="true" /></div><h1 className="mt-4 text-lg font-black text-foreground">Site administration</h1><p className="mt-1 text-xs leading-5 text-muted">Sign in to edit live website content.</p></div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="admin-label"><span>Email</span><input type="text" inputMode="email" autoComplete="username" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} className="admin-input" /></label>
          <label className="admin-label"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="admin-input" /></label>
          {error && <p role="alert" className="rounded-lg bg-rd-red/10 px-3 py-2 text-xs font-semibold text-rd-red">{error}</p>}
          <button type="submit" disabled={loading} className="admin-action mt-1 w-full bg-primary text-primary-foreground hover:bg-primary-600 disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
        </form>
      </div>
    </div>
  );
}
