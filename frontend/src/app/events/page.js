"use client";
// src/app/events/page.js

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner, Alert } from "@/components/ui";

function EventCard({ event, user }) {
  const isFull = event.spotsLeft <= 0;
  const date   = new Date(event.dateTime).toLocaleString("en-GB", {
    dateStyle: "medium", timeStyle: "short",
  });

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">{event.title}</h2>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
            isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
          }`}
        >
          {isFull ? "Sold Out" : `${event.spotsLeft} spots left`}
        </span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>

      <div className="text-xs text-gray-400 flex gap-4">
        <span>📅 {date}</span>
        <span>👤 {event.organiser?.name}</span>
        <span>🎟 {event.bookingsCount} / {event.capacity}</span>
      </div>

      <Link
        href={`/events/${event.id}`}
        className="mt-auto self-start bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        View Details
      </Link>
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    eventsApi.getAll()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">All Events</h1>
        {user?.role === "ORGANISER" && (
          <Link
            href="/events/create"
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Event
          </Link>
        )}
      </div>

      <Alert type="error" message={error} />

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => (
            <EventCard key={e.id} event={e} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
