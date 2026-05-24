// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.create({ data: { name: "Alice Organiser", email: "alice@example.com", password: hash, role: "ORGANISER" } });
  const bob   = await prisma.user.create({ data: { name: "Bob Organiser",   email: "bob@example.com",   password: hash, role: "ORGANISER" } });
  const carol = await prisma.user.create({ data: { name: "Carol Attendee",  email: "carol@example.com", password: hash, role: "ATTENDEE" } });
  const dave  = await prisma.user.create({ data: { name: "Dave Attendee",   email: "dave@example.com",  password: hash, role: "ATTENDEE" } });
  const eve   = await prisma.user.create({ data: { name: "Eve Attendee",    email: "eve@example.com",   password: hash, role: "ATTENDEE" } });

  const e1 = await prisma.event.create({ data: { title: "Tech Conference 2026", description: "Annual technology conference covering AI, Web, and Cloud topics.", dateTime: new Date("2026-06-15T09:00:00Z"), capacity: 3, organiserId: alice.id } });
  const e2 = await prisma.event.create({ data: { title: "JavaScript Workshop",  description: "Hands-on workshop covering modern JavaScript and Node.js.", dateTime: new Date("2026-07-20T14:00:00Z"), capacity: 2, organiserId: alice.id } });
  const e3 = await prisma.event.create({ data: { title: "Startup Networking Night", description: "Connect with founders, investors, and tech enthusiasts.", dateTime: new Date("2026-08-10T18:00:00Z"), capacity: 100, organiserId: bob.id } });
  const e4 = await prisma.event.create({ data: { title: "Full Stack Bootcamp", description: "Intensive 2-day bootcamp on building full-stack web applications.", dateTime: new Date("2026-09-01T09:00:00Z"), capacity: 1, organiserId: bob.id } });

  await prisma.booking.createMany({
    data: [
      { userId: carol.id, eventId: e1.id },
      { userId: dave.id,  eventId: e1.id },
      { userId: eve.id,   eventId: e1.id },
      { userId: carol.id, eventId: e2.id },
      { userId: dave.id,  eventId: e2.id },
      { userId: carol.id, eventId: e3.id },
      { userId: dave.id,  eventId: e4.id },
    ],
  });

  console.log("✅  Seeding complete!");
  console.log("Accounts (password: password123):");
  console.log("  alice@example.com | bob@example.com  → ORGANISER");
  console.log("  carol@example.com | dave@example.com | eve@example.com → ATTENDEE");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
