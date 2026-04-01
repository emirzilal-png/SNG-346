// src/controllers/eventController.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * GET /api/events
 * Public – list all upcoming events with booking counts.
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organiser: { select: { id: true, name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    const result = events.map((e) => ({
      ...e,
      bookingsCount: e._count.bookings,
      spotsLeft: e.capacity - e._count.bookings,
      _count: undefined,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("getAllEvents error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/events/:id
 * Public – single event detail.
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        organiser: { select: { id: true, name: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json({
      ...event,
      bookingsCount: event._count.bookings,
      spotsLeft: event.capacity - event._count.bookings,
      _count: undefined,
    });
  } catch (error) {
    console.error("getEventById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/events
 * Organiser only – create a new event.
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, capacity } = req.body;
    const organiserId = req.session.user.id;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        dateTime: new Date(dateTime),
        capacity: Number(capacity),
        organiserId,
      },
    });

    return res.status(201).json({ message: "Event created", event });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /api/events/:id
 * Organiser only – update own event.
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (event.organiserId !== userId) {
      return res.status(403).json({ error: "Forbidden: you do not own this event" });
    }

    const { title, description, dateTime, capacity } = req.body;

    // Ensure new capacity is not less than current bookings
    if (capacity !== undefined) {
      const bookingCount = await prisma.booking.count({ where: { eventId: Number(id) } });
      if (Number(capacity) < bookingCount) {
        return res.status(409).json({
          error: `Capacity cannot be less than current bookings (${bookingCount})`,
        });
      }
    }

    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
      },
    });

    return res.status(200).json({ message: "Event updated", event: updated });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/events/:id
 * Organiser only – delete own event (and its bookings).
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (event.organiserId !== userId) {
      return res.status(403).json({ error: "Forbidden: you do not own this event" });
    }

    // Delete related bookings first to respect FK constraints
    await prisma.booking.deleteMany({ where: { eventId: Number(id) } });
    await prisma.event.delete({ where: { id: Number(id) } });

    return res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
