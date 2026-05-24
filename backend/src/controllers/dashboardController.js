// src/controllers/dashboardController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getOrgDashboard = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organiserId: req.session.user.id },
      include: { bookings: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { dateTime: "asc" },
    });
    return res.status(200).json({
      organiser: req.session.user.name,
      events: events.map((e) => ({ id: e.id, title: e.title, dateTime: e.dateTime, capacity: e.capacity, ticketsSold: e.bookings.length, spotsLeft: e.capacity - e.bookings.length, attendees: e.bookings.map((b) => ({ bookingId: b.id, bookedAt: b.createdAt, user: b.user })) })),
    });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const getEventAttendees = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.organiserId !== req.session.user.id) return res.status(403).json({ error: "Forbidden" });
    const bookings = await prisma.booking.findMany({ where: { eventId: Number(req.params.id) }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } });
    return res.status(200).json({ eventId: event.id, title: event.title, capacity: event.capacity, ticketsSold: bookings.length, attendees: bookings.map((b) => ({ bookingId: b.id, bookedAt: b.createdAt, ...b.user })) });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

module.exports = { getOrgDashboard, getEventAttendees };
