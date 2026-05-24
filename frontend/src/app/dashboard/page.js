"use client";
// src/app/dashboard/page.js

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Spinner, Alert } from "@/components/ui";

function EventRow({ event }) {
  const [open, setOpen] = useState(false);
  const date = new Date(event.dateTime).toLocaleString("en-GB", {
    dateStyle: "medium", timeStyle: "short",
  });

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-800 truncate">{event.title}</h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {event.ticketsSold} / {event.capacity} sold
            </span>
            {event.spotsLeft === 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Full</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">📅 {date}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/events/${event.id}/edit`}
            className="text-sm border border-indigo-400 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-50 transition"
          >
            Edit
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
          >
            {open ? "Hide" : "Attendees"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t px-5 pb-4">
          {event.attendees.length === 0 ? (
            <p className="text-sm text-gray-400 py-3">No attendees yet.</p>
          ) : (
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Booked At</th>
                </tr>
              </thead>
              <tbody>
                {event.attendees.map((a) => (
                  <tr key={a.bookingId} className="border-b last:border-0">
                    <td className="py-2">{a.user.name}</td>
                    <td className="py-2 text-gray-500">{a.user.email}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(a.bookedAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ORGANISER") { router.replace("/events"); return; }

    dashboardApi.summary()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <Spinner />;

  const totalSold = data?.events?.reduce((sum, e) => sum + e.ticketsSold, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Organiser Dashboard</h1>
        <Link
          href="/events/create"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + New Event
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{data?.events?.length ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Events</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{totalSold}</p>
          <p className="text-sm text-gray-500 mt-1">Tickets Sold</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">
            {data?.events?.filter((e) => e.spotsLeft > 0).length ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Events with Spots</p>
        </div>
      </div>

      <Alert type="error" message={error} />

      {data?.events?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>You have no events yet.</p>
          <Link href="/events/create" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.events.map((e) => <EventRow key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
