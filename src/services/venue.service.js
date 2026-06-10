import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const getAllVenues = async () => {
  return prisma.venue.findMany({ orderBy: { name: 'asc' } });
};

export const getSlotsByVenueAndDate = async (venueId, dateStr) => {
  if (!dateStr) {
    throw new ApiError(400, 'Query parameter "date" is required (YYYY-MM-DD)');
  }

  const parsed = new Date(dateStr + 'T00:00:00.000Z');
  if (isNaN(parsed.getTime())) {
    throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
  }

  // check venue exists
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) {
    throw new ApiError(404, 'Venue not found');
  }

  // day boundary in UTC
  const dayStart = parsed;
  const dayEnd = new Date(parsed);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const slots = await prisma.slot.findMany({
    where: {
      venueId,
      startAt: { gte: dayStart, lt: dayEnd },
    },
    include: {
      booking: {
        select: { id: true, userId: true },
      },
    },
    orderBy: { startAt: 'asc' },
  });

  return {
    venueId: venue.id,
    venueName: venue.name,
    date: dateStr,
    slots: slots.map((s) => ({
      id: s.id,
      startAt: s.startAt,
      endAt: s.endAt,
      isBooked: s.booking !== null,
      ...(s.booking && { booking: s.booking }),
    })),
  };
};
