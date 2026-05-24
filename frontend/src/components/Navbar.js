"use client";
// src/components/Navbar.js

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-indigo-700 text-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          🎟 EventHub
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/events" className="hover:text-indigo-200 transition">
            Events
          </Link>

          {user ? (
            <>
              {user.role === "ORGANISER" && (
                <>
                  <Link href="/events/create" className="hover:text-indigo-200 transition">
                    + Create Event
                  </Link>
                  <Link href="/dashboard" className="hover:text-indigo-200 transition">
                    Dashboard
                  </Link>
                </>
              )}
              {user.role === "ATTENDEE" && (
                <Link href="/my-bookings" className="hover:text-indigo-200 transition">
                  My Bookings
                </Link>
              )}
              <span className="text-indigo-200">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-200 transition">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
