"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type AuthMode = "login" | "signup";

type AuthUser = {
  name: string;
  email: string;
};

type LoginValues = {
  email: string;
  password: string;
};

type SignupValues = LoginValues & {
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthOpen: boolean;
  authMode: AuthMode;
  returnTo: string | null;
  authError: string | null;
  openAuth: (mode?: AuthMode, returnTo?: string | null) => void;
  closeAuth: () => void;
  requireAuth: (returnTo?: string | null) => boolean;
  login: (values: LoginValues) => Promise<void>;
  signup: (values: SignupValues) => Promise<void>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "weddingsl-auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      // Ignore storage parse failures and start logged out.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthOpen && (pathname === "/login" || pathname === "/signup")) {
      setIsAuthOpen(false);
    }
  }, [isAuthOpen, pathname]);

  const persistUser = (nextUser: AuthUser | null) => {
    setUser(nextUser);
    if (typeof window !== "undefined") {
      if (nextUser) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  };

  const openAuth = (mode: AuthMode = "login", nextReturnTo: string | null = null) => {
    setAuthMode(mode);
    setReturnTo(nextReturnTo);
    setAuthError(null);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthError(null);
  };

  const requireAuth = (nextReturnTo: string | null = null) => {
    if (!user) {
      openAuth("login", nextReturnTo);
      return false;
    }

    if (nextReturnTo) {
      router.push(nextReturnTo);
    }

    return true;
  };

  const syncAuthUser = async (mode: AuthMode, values: LoginValues | SignupValues) => {
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Authentication failed.");
    }

    const data = (await response.json()) as { user: AuthUser; token: string };
    localStorage.setItem("token", data.token);
    persistUser(data.user);
    setAuthError(null);
    closeAuth();

    if (returnTo) {
      router.push(returnTo);
      setReturnTo(null);
    }
  };

  const login = async (values: LoginValues) => {
    try {
      await syncAuthUser("login", values);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Invalid user name or email.");
      throw error;
    }
  };

  const signup = async (values: SignupValues) => {
    try {
      await syncAuthUser("signup", values);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to save account.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    persistUser(null);
    setReturnTo(null);
    setIsAuthOpen(false);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthOpen,
      authMode,
      returnTo,
      authError,
      openAuth,
      closeAuth,
      requireAuth,
      login,
      signup,
      logout,
    }),
    [user, isAuthOpen, authMode, returnTo, authError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isHydrated && isAuthOpen && pathname !== "/login" && pathname !== "/signup" ? <AuthModal isOpen /> : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

function AuthModal({ isOpen }: { isOpen: boolean }) {
  const { authMode, authError, closeAuth, openAuth, login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authMode === "signup") {
      void signup({ name, email, password }).catch(() => {});
      return;
    }

    void login({ email, password }).catch(() => {});
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-[#0f5b47]/65 px-4 py-6 transition-opacity duration-150 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={closeAuth}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#fffdf8] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a24f]">WeddingSL Access</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#0f5b47]">
              {authMode === "login" ? "Sign in to continue" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-[#607067]">
              {authMode === "login"
                ? "Sign in before starting a booking or opening your profile."
                : "Create an account to keep your wedding plans and bookings together."}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            className="rounded-full border border-[#eadfcb] p-2 text-[#607067] transition hover:bg-[#fbf7ef]"
            aria-label="Close auth dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#fbf7ef] p-1">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${authMode === "login" ? "bg-white text-[#0f5b47] shadow-sm" : "text-[#607067]"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${authMode === "signup" ? "bg-white text-[#0f5b47] shadow-sm" : "text-[#607067]"}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {authMode === "signup" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#17352c]">Full Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c9a24f]"
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
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c9a24f]"
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
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c9a24f]"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#0f5b47] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0c4a3a]"
          >
            {authMode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {authError ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {authError}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-[#607067]">
          <Link href="/login" className="hover:text-[#0f5b47]" onClick={closeAuth}>
            Open login page
          </Link>
          <Link href="/signup" className="hover:text-[#0f5b47]" onClick={closeAuth}>
            Open signup page
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}