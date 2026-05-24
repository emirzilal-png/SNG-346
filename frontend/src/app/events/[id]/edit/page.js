"use client";
// src/app/events/[id]/edit/page.js

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner, Alert } from "@/components/ui";

export default function EditEventPage() {
  const { id }           = useParams();
  const { user, loading: authLoading } = useAuth();
  const router           = useRouter();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [dateTime,    setDateTime]    = useState("");
  const [capacity,    setCapacity]    = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ORGANISER") { router.replace("/events"); return; }

    eventsApi.getOne(id)
      .then((ev) => {
        if (ev.organiser?.id !== user.id) { router.replace("/events"); return; }
        setTitle(ev.title);
        setDescription(ev.description);
        // Format for datetime-local input (strip seconds & Z)
        setDateTime(new Date(ev.dateTime).toISOString().slice(0, 16));
        setCapacity(String(ev.capacity));
      })
      .catch((e) => setError(e.message))
      .finally(() => setPageLoading(false));
  }, [id, user, authLoading, router]);

  if (authLoading || pageLoading) return <Spinner />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (Number(capacity) < 1) { setError("Capacity must be at least 1."); return; }

    setSubmitting(true);
    try {
      await eventsApi.update(id, { title, description, dateTime, capacity: Number(capacity) });
      router.push(`/events/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href={`/events/${id}`} className="text-sm text-indigo-600 hover:underline">
        ← Back to Event
      </Link>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <h1 className="text-2xl font-bold text-gray-800">Edit Event</h1>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
