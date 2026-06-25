"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { isAuthenticated, authError, login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "signup") {
      await signup({ name, email, password });
      router.push("/myprofile");
      return;
    }

    await login({ email, password });
    router.push("/myprofile");
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,#f7f1e4_0,#fbf7ef_40%,#f2eadf_100%)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] bg-[#0f5b47] p-8 text-white shadow-2xl lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
            <ShieldCheck className="h-4 w-4" />
            Secure access
          </div>
          <h1 className="mt-8 max-w-xl text-4xl leading-tight md:text-6xl">
            {mode === "login" ? "Welcome back to WeddingSL" : "Create your WeddingSL account"}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 md:text-base">
            {mode === "login"
              ? "Sign in to continue booking services, view your profile, and manage wedding plans."
              : "Sign up once and keep your bookings, saved vendors, and planning details in one place."}
          </p>
        </section>

        <section className="rounded-[32px] border border-[#eadfcb] bg-white p-8 shadow-xl lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f5b47] text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#17352c]">WeddingSL</p>
              <p className="text-xs text-[#607067]">Muslim Wedding Platform</p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
              You are already signed in. <Link href="/myprofile" className="font-semibold underline">Go to your profile</Link>.
            </div>
          ) : null}

          {authError ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
              {authError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#17352c]">Full Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 outline-none transition focus:border-[#c9a24f]"
                  placeholder="Amina Rahman"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#17352c]">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 outline-none transition focus:border-[#c9a24f]"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#17352c]">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 outline-none transition focus:border-[#c9a24f]"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f5b47] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0c4a3a]"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-[#607067]">
            <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-[#0f5b47] hover:underline">
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
            </Link>
            <Link href="/" className="hover:text-[#0f5b47]">
              Back home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}