// src/controllers/eventController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { organiser: { select: { id: true, name: true } }, _count: { select: { bookings: true } } },
      orderBy: { dateTime: "asc" },
    });
    return res.status(200).json(events.map((e) => ({ ...e, bookingsCount: e._count.bookings, spotsLeft: e.capacity - e._count.bookings, _count: undefined })));
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
      include: { organiser: { select: { id: true, name: true } }, _count: { select: { bookings: true } } },
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    return res.status(200).json({ ...event, bookingsCount: event._count.bookings, spotsLeft: event.capacity - event._count.bookings, _count: undefined });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, dateTime, capacity } = req.body;
    const event = await prisma.event.create({ data: { title, description, dateTime: new Date(dateTime), capacity: Number(capacity), organiserId: req.session.user.id } });
    return res.status(201).json({ message: "Event created", event });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const updateEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.organiserId !== req.session.user.id) return res.status(403).json({ error: "Forbidden" });
    const { title, description, dateTime, capacity } = req.body;
    if (capacity !== undefined) {
      const count = await prisma.booking.count({ where: { eventId: Number(req.params.id) } });
      if (Number(capacity) < count) return res.status(409).json({ error: `Capacity cannot be less than current bookings (${count})` });
    }
    const updated = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: { ...(title && { title }), ...(description && { description }), ...(dateTime && { dateTime: new Date(dateTime) }), ...(capacity !== undefined && { capacity: Number(capacity) }) },
    });
    return res.status(200).json({ message: "Event updated", event: updated });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.organiserId !== req.session.user.id) return res.status(403).json({ error: "Forbidden" });
    await prisma.booking.deleteMany({ where: { eventId: Number(req.params.id) } });
    await prisma.event.delete({ where: { id: Number(req.params.id) } });
    return res.status(200).json({ message: "Event deleted" });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
