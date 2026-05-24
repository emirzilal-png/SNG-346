// src/controllers/bookingController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.session.user.id;
    const event = await prisma.event.findUnique({ where: { id: Number(eventId) }, include: { _count: { select: { bookings: true } } } });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event._count.bookings >= event.capacity) return res.status(409).json({ error: "Event is fully booked" });
    const existing = await prisma.booking.findUnique({ where: { userId_eventId: { userId, eventId: Number(eventId) } } });
    if (existing) return res.status(409).json({ error: "You already have a booking for this event" });
    const booking = await prisma.booking.create({ data: { userId, eventId: Number(eventId) }, include: { event: { select: { id: true, title: true, dateTime: true } } } });
    return res.status(201).json({ message: "Booking confirmed", booking });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.session.user.id },
      include: { event: { select: { id: true, title: true, description: true, dateTime: true, capacity: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(bookings);
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.userId !== req.session.user.id) return res.status(403).json({ error: "Forbidden" });
    await prisma.booking.delete({ where: { id: Number(req.params.id) } });
    return res.status(200).json({ message: "Booking cancelled" });
  } catch (e) { return res.status(500).json({ error: "Internal server error" }); }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
