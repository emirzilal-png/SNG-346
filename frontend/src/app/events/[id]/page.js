"use client";
// src/app/events/[id]/page.js

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { eventsApi, bookingsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner, Alert } from "@/components/ui";

export default function EventDetailPage() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const router       = useRouter();

  const [event,    setEvent]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  useEffect(() => {
    eventsApi.getOne(id)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    setError(""); setSuccess(""); setBooking(true);
    try {
      await bookingsApi.book(Number(id));
      setSuccess("🎉 Booking confirmed!");
      // Refresh event to update spot count
      const updated = await eventsApi.getOne(id);
      setEvent(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBooking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await eventsApi.remove(id);
      router.push("/events");
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!event && error) return <Alert type="error" message={error} />;
  if (!event) return null;

  const isFull      = event.spotsLeft <= 0;
  const isOrganiser = user?.role === "ORGANISER";
  const isOwner     = isOrganiser && user?.id === event.organiser?.id;
  const isAttendee  = user?.role === "ATTENDEE";
  const date        = new Date(event.dateTime).toLocaleString("en-GB", {
    dateStyle: "long", timeStyle: "short",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/events" className="text-sm text-indigo-600 hover:underline">
        ← Back to Events
      </Link>

      {/* Card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          <span
            className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${
              isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
            }`}
          >
            {isFull ? "Sold Out" : `${event.spotsLeft} spots left`}
          </span>
        </div>

        <p className="text-gray-600">{event.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
          <div>📅 <span className="text-gray-700 font-medium">{date}</span></div>
          <div>🎟 <span className="text-gray-700 font-medium">{event.bookingsCount} / {event.capacity} booked</span></div>
          <div>👤 <span className="text-gray-700 font-medium">{event.organiser?.name}</span></div>
        </div>

        <Alert type="error"   message={error} />
        <Alert type="success" message={success} />

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap pt-2">
          {isAttendee && !isFull && (
            <button
              onClick={handleBook}
              disabled={booking}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {booking ? "Booking…" : "Book Ticket"}
            </button>
          )}
          {isAttendee && isFull && (
            <span className="text-sm text-red-500 font-medium self-center">This event is fully booked.</span>
          )}
          {!user && (
            <Link href="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Login to Book
            </Link>
          )}
          {isOwner && (
            <>
              <Link
                href={`/events/${id}/edit`}
                className="border border-indigo-600 text-indigo-600 px-5 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
              >
                Edit Event
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="border border-red-400 text-red-500 px-5 py-2 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete Event"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
