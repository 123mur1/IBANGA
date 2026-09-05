"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { BrandLink } from "@/components/brand";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import { seedUsers } from "@/lib/mock-data";
import { dashboardPath, useIbanga } from "@/lib/store";
import { Avatar } from "@/components/photos";

function LoginForm() {
  const { login, loginAs, currentUser } = useIbanga();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const next = params.get("next");
      router.replace(next || dashboardPath(currentUser.role));
    }
  }, [currentUser, params, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = login(email);
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
        Frontend demo — any password works. Use a demo account or an email you
        registered.
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
            defaultValue="demo"
            required
          />
        </Field>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <PrimaryButton className="w-full" type="submit">
          Continue
        </PrimaryButton>
      </form>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Demo accounts
        </p>
        <div className="mt-3 space-y-2">
          {seedUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                loginAs(user.id);
                router.push(dashboardPath(user.role));
              }}
              className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left hover:bg-background"
            >
              <span className="flex items-center gap-3">
                <Avatar src={user.photo} name={user.name} size="sm" />
                <span>
                <span className="block text-sm font-semibold text-navy">
                  {user.name}
                </span>
                <span className="text-xs text-muted">
                  {user.role.replace("_", " ")} · {user.email}
                </span>
                </span>
              </span>
              <span className="text-brand">Enter</span>
            </button>
          ))}
        </div>
      </div>
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
