"use client";
// src/app/my-bookings/page.js

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bookingsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner, Alert } from "@/components/ui";

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [cancelling, setCancelling] = useState(null); // booking id being cancelled

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ATTENDEE") { router.replace("/events"); return; }

    bookingsApi.myBookings()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      await bookingsApi.cancel(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelling(null);
    }
  };

  if (authLoading || loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>

      <Alert type="error" message={error} />

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🎟</p>
          <p>You have no bookings yet.</p>
          <Link href="/events" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
            Browse Events →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const date = new Date(b.event.dateTime).toLocaleString("en-GB", {
              dateStyle: "medium", timeStyle: "short",
            });
            return (
              <div key={b.id} className="bg-white rounded-xl shadow p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-semibold text-gray-800">{b.event.title}</h2>
                  <p className="text-sm text-gray-500">📅 {date}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{b.event.description}</p>
                  <Link
                    href={`/events/${b.event.id}`}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    View event →
                  </Link>
                </div>
                <button
                  onClick={() => handleCancel(b.id)}
                  disabled={cancelling === b.id}
                  className="shrink-0 border border-red-400 text-red-500 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                >
                  {cancelling === b.id ? "Cancelling…" : "Cancel"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
