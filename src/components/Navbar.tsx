"use client";

import { Heart, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const linkClass = (href: string) =>
    pathname === href
      ? "text-[#D4A373] border-b-2 border-[#D4A373] pb-1"
      : "hover:text-[#1E3A2B] transition";

  return (
    <header className="w-full bg-[#FAF7F0] px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-[#D4A373] flex items-center justify-center text-white">
          <Heart size={16} fill="currentColor" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight leading-none text-[#1E3A2B]">WeddingSL</h1>
          <p className="text-[10px] text-gray-500">Muslim Wedding Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
        <Link href="/" className={linkClass("/")}>Home</Link>
        <Link href="/services" className={linkClass("/services")}>Services</Link>
        <Link href="/my-planner" className={linkClass("/my-planner")}>My Planner</Link>
        <Link href="/gift-exchange" className={linkClass("/gift-exchange")}>Gift Exchange</Link>
        <Link href="/mehndi-night" className={linkClass("/mehndi-night")}>Mehndi Night</Link>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {!isAuthenticated ? (
          <>
            <Link
              href="/login"
              className="rounded-full border border-[#1E3A2B] px-4 py-2 text-[#1E3A2B] transition hover:bg-[#1E3A2B] hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#D4A373] px-4 py-2 text-white transition hover:bg-[#c08f57]"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-[#1E3A2B] text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-opacity-90 transition"
            >
              <User size={16} />
              <span>My Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/myprofile" className="bg-[#1E3A2B] text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-opacity-90 transition">
              <User size={16} />
              <span>My Profile</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-gray-300 px-4 py-2 text-gray-600 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}