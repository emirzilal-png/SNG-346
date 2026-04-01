// src/controllers/bookingController.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * POST /api/bookings
 * Attendee only – book a ticket for an event.
 * Body: { eventId }
 */
const createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.session.user.id;

    // Check event exists
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: { _count: { select: { bookings: true } } },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check overbooking
    if (event._count.bookings >= event.capacity) {
      return res.status(409).json({ error: "Event is fully booked" });
    }

    // Check duplicate booking (unique constraint also enforces this at DB level)
    const existing = await prisma.booking.findUnique({
      where: { userId_eventId: { userId, eventId: Number(eventId) } },
    });
    if (existing) {
      return res.status(409).json({ error: "You already have a booking for this event" });
    }

    const booking = await prisma.booking.create({
      data: { userId, eventId: Number(eventId) },
      include: {
        event: { select: { id: true, title: true, dateTime: true } },
      },
    });

    return res.status(201).json({ message: "Booking confirmed", booking });
  } catch (error) {
    console.error("createBooking error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/bookings/my
 * Attendee only – list the current user's bookings.
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        event: {
          select: { id: true, title: true, description: true, dateTime: true, capacity: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("getMyBookings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/bookings/:id
 * Attendee only – cancel own booking.
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: this booking does not belong to you" });
    }

    await prisma.booking.delete({ where: { id: Number(id) } });

    return res.status(200).json({ message: "Booking cancelled" });
  } catch (error) {
    console.error("cancelBooking error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
