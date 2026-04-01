// prisma/seed.js
// Adapted from: Prisma official seeding documentation - https://www.prisma.io/docs/guides/migrate/seed-database

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  // ── Clean existing data (order respects FK constraints) ──────────────────
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const organiser1 = await prisma.user.create({
    data: {
      name: "Alice Organiser",
      email: "alice@example.com",
      password: hashedPassword,
      role: "ORGANISER",
    },
  });

  const organiser2 = await prisma.user.create({
    data: {
      name: "Bob Organiser",
      email: "bob@example.com",
      password: hashedPassword,
      role: "ORGANISER",
    },
  });

  const attendee1 = await prisma.user.create({
    data: {
      name: "Carol Attendee",
      email: "carol@example.com",
      password: hashedPassword,
      role: "ATTENDEE",
    },
  });

  const attendee2 = await prisma.user.create({
    data: {
      name: "Dave Attendee",
      email: "dave@example.com",
      password: hashedPassword,
      role: "ATTENDEE",
    },
  });

  const attendee3 = await prisma.user.create({
    data: {
      name: "Eve Attendee",
      email: "eve@example.com",
      password: hashedPassword,
      role: "ATTENDEE",
    },
  });

  // ── Events ───────────────────────────────────────────────────────────────
  const event1 = await prisma.event.create({
    data: {
      title: "Tech Conference 2026",
      description: "Annual technology conference covering AI, Web, and Cloud topics.",
      dateTime: new Date("2026-06-15T09:00:00Z"),
      capacity: 3,
      organiserId: organiser1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "JavaScript Workshop",
      description: "Hands-on workshop covering modern JavaScript and Node.js.",
      dateTime: new Date("2026-05-20T14:00:00Z"),
      capacity: 2,
      organiserId: organiser1.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Startup Networking Night",
      description: "Connect with founders, investors, and tech enthusiasts.",
      dateTime: new Date("2026-07-10T18:00:00Z"),
      capacity: 100,
      organiserId: organiser2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: "Full Stack Bootcamp",
      description: "Intensive 2-day bootcamp on building full-stack web applications.",
      dateTime: new Date("2026-08-01T09:00:00Z"),
      capacity: 1,
      organiserId: organiser2.id,
    },
  });

  // ── Bookings ─────────────────────────────────────────────────────────────
  await prisma.booking.createMany({
    data: [
      { userId: attendee1.id, eventId: event1.id },
      { userId: attendee2.id, eventId: event1.id },
      { userId: attendee3.id, eventId: event1.id },
      { userId: attendee1.id, eventId: event2.id },
      { userId: attendee2.id, eventId: event2.id }, // event2 now full (capacity 2)
      { userId: attendee1.id, eventId: event3.id },
      { userId: attendee2.id, eventId: event4.id }, // event4 now full (capacity 1)
    ],
  });

  console.log("✅  Seeding complete!");
  console.log("\nTest accounts (password: password123):");
  console.log("  Organisers : alice@example.com | bob@example.com");
  console.log("  Attendees  : carol@example.com | dave@example.com | eve@example.com");
}

main()
  .catch((e) => {
    console.error("❌  Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
