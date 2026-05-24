// src/lib/api.js
// Adapted from: Next.js fetch documentation - https://nextjs.org/docs/app/api-reference/functions/fetch

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",           // send session cookie automatically
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => apiFetch("/auth/register", { method: "POST", body }),
  login:    (body) => apiFetch("/auth/login",    { method: "POST", body }),
  logout:   ()     => apiFetch("/auth/logout",   { method: "POST" }),
  me:       ()     => apiFetch("/auth/me"),
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsApi = {
  getAll:  ()         => apiFetch("/events"),
  getOne:  (id)       => apiFetch(`/events/${id}`),
  create:  (body)     => apiFetch("/events",     { method: "POST",   body }),
  update:  (id, body) => apiFetch(`/events/${id}`, { method: "PUT",  body }),
  remove:  (id)       => apiFetch(`/events/${id}`, { method: "DELETE" }),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  myBookings:   ()         => apiFetch("/bookings/my"),
  book:         (eventId)  => apiFetch("/bookings",    { method: "POST",   body: { eventId } }),
  cancel:       (id)       => apiFetch(`/bookings/${id}`, { method: "DELETE" }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  summary:   ()    => apiFetch("/dashboard"),
  attendees: (id)  => apiFetch(`/dashboard/event/${id}/attendees`),
};
