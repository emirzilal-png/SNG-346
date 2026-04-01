// src/controllers/dashboardController.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * GET /api/dashboard
 * Organiser only – summary of all their events with tickets sold and attendee lists.
 */
const getOrgDashboard = async (req, res) => {
  try {
    const organiserId = req.session.user.id;

    const events = await prisma.event.findMany({
      where: { organiserId },
      include: {
        bookings: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    const dashboard = events.map((event) => ({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      capacity: event.capacity,
      ticketsSold: event.bookings.length,
      spotsLeft: event.capacity - event.bookings.length,
      attendees: event.bookings.map((b) => ({
        bookingId: b.id,
        bookedAt: b.createdAt,
        user: b.user,
      })),
    }));

    return res.status(200).json({ organiser: req.session.user.name, events: dashboard });
  } catch (error) {
    console.error("getOrgDashboard error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/dashboard/event/:id/attendees
 * Organiser only – attendee list for a specific event.
 */
const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const organiserId = req.session.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (event.organiserId !== organiserId) {
      return res.status(403).json({ error: "Forbidden: you do not own this event" });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      eventId: event.id,
      title: event.title,
      capacity: event.capacity,
      ticketsSold: bookings.length,
      attendees: bookings.map((b) => ({ bookingId: b.id, bookedAt: b.createdAt, ...b.user })),
    });
  } catch (error) {
    console.error("getEventAttendees error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getOrgDashboard, getEventAttendees };
