"use client";
// src/app/events/create/page.js

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner, Alert } from "@/components/ui";

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [dateTime,    setDateTime]    = useState("");
  const [capacity,    setCapacity]    = useState("");
  const [error,       setError]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  // Protected route: redirect non-organisers
  useEffect(() => {
    if (!loading && (!user || user.role !== "ORGANISER")) {
      router.replace("/events");
    }
  }, [user, loading, router]);

  if (loading || !user) return <Spinner />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !dateTime || !capacity) {
      setError("All fields are required."); return;
    }
    if (Number(capacity) < 1) {
      setError("Capacity must be at least 1."); return;
    }

    setSubmitting(true);
    try {
      const { event } = await eventsApi.create({ title, description, dateTime, capacity: Number(capacity) });
      router.push(`/events/${event.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/events" className="text-sm text-indigo-600 hover:underline">
        ← Back to Events
      </Link>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your event…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Max attendees"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
