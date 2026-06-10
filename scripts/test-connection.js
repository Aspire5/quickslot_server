// ──────────────────────────────────────────────────────
// QuickSlot — Database Connection Test Script
// Usage: node scripts/test-connection.js
// ──────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("🔌 Attempting to connect to PostgreSQL…\n");

  // 1. Raw connectivity check
  const [result] = await prisma.$queryRaw`SELECT NOW() AS server_time`;
  console.log(`✅ Connected successfully at ${result.server_time}\n`);

  // 2. Verify that all four tables are reachable
  const [userCount, venueCount, slotCount, bookingCount] = await Promise.all([
    prisma.user.count(),
    prisma.venue.count(),
    prisma.slot.count(),
    prisma.booking.count(),
  ]);

  console.log("📊 Table row counts:");
  console.log(`   users    → ${userCount}`);
  console.log(`   venues   → ${venueCount}`);
  console.log(`   slots    → ${slotCount}`);
  console.log(`   bookings → ${bookingCount}`);
  console.log("\n🎉 All tables accessible. Database is ready.\n");
}

main()
  .catch((error) => {
    console.error("❌ Connection failed:\n", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
