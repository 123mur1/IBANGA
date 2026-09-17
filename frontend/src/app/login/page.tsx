"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { BrandLink } from "@/components/brand";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import { dashboardPath, useIbanga } from "@/lib/store";

function LoginForm() {
  const { login, currentUser } = useIbanga();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const next = params.get("next");
      router.replace(next || dashboardPath(currentUser.role));
    }
  }, [currentUser, params, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await login(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    const next = params.get("next");
    router.push(next || "/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-line bg-card p-8">
      <h1 className="font-display text-3xl text-navy">Log in</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to your iBanga account. You will land on the dashboard for your
        role.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <PrimaryButton className="w-full" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Continue"}
        </PrimaryButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background paper-grid">
      <header className="px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <BrandLink />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
