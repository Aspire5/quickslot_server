import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const USERS = [
  { firstName: 'John', lastName: 'Doe', username: 'john_doe', password: 'password123' },
  { firstName: 'Jane', lastName: 'Smith', username: 'jane_smith', password: 'password123' },
  { firstName: 'Dev', lastName: 'Tester', username: 'dev_tester', password: 'password123' },
];

const VENUES = [
  { name: 'Smash Arena', location: 'Sector 15, Gurgaon' },
  { name: 'TurfZone', location: 'MG Road, Bangalore' },
  { name: 'NetPlay Courts', location: 'Andheri West, Mumbai' },
  { name: 'SportSquare', location: 'Koramangala, Bangalore' },
  { name: 'CourtX', location: 'Connaught Place, Delhi' },
];

// hourly slots from 6 AM to 10 PM (6:00–22:00), 16 slots per day
const SLOT_START_HOUR = 6;
const SLOT_END_HOUR = 22;

function buildSlotsForDate(venueId, date) {
  const slots = [];
  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour++) {
    const startAt = new Date(date);
    startAt.setUTCHours(hour, 0, 0, 0);

    const endAt = new Date(date);
    endAt.setUTCHours(hour + 1, 0, 0, 0);

    slots.push({ venueId, startAt, endAt });
  }
  return slots;
}

function getDateRange(days) {
  const dates = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d);
  }
  return dates;
}

async function main() {
  console.log('Seeding database...\n');

  // seed users
  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
  const users = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        password: hashedPassword,
      },
    });
    users.push(user);
    console.log(`  User: ${user.username} (${user.id})`);
  }

  // seed venues
  const venues = [];
  for (const v of VENUES) {
    const venue = await prisma.venue.create({ data: v });
    venues.push(venue);
    console.log(`  Venue: ${venue.name} (${venue.id})`);
  }

  // seed slots — today + next 7 days
  const dates = getDateRange(7);
  let slotCount = 0;

  for (const venue of venues) {
    for (const date of dates) {
      const slots = buildSlotsForDate(venue.id, date);

      // use createMany for speed, skip duplicates
      const result = await prisma.slot.createMany({
        data: slots,
        skipDuplicates: true,
      });
      slotCount += result.count;
    }
  }

  console.log(`  Slots created: ${slotCount}`);
  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
