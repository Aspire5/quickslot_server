import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const createBooking = async (userId, slotId) => {
  if (!slotId) {
    throw new ApiError(400, 'slotId is required');
  }

  // verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // transaction with row-level lock to prevent double-booking
  const booking = await prisma.$transaction(async (tx) => {
    // lock the slot row so concurrent requests wait here
    const rows = await tx.$queryRaw`
      SELECT id, venue_id FROM slots WHERE id = ${slotId}::uuid FOR UPDATE
    `;

    if (rows.length === 0) {
      throw new ApiError(404, 'Slot not found');
    }

    // check if someone already booked this slot
    const existing = await tx.booking.findUnique({ where: { slotId } });
    if (existing) {
      throw new ApiError(409, 'This slot has already been booked');
    }

    return tx.booking.create({
      data: { userId, slotId },
      include: {
        slot: {
          include: { venue: { select: { id: true, name: true } } },
        },
      },
    });
  }, {
    isolationLevel: 'Serializable',
    timeout: 5000,
  });

  return booking;
};

export const cancelBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.userId !== userId) {
    throw new ApiError(403, 'You can only cancel your own bookings');
  }

  await prisma.booking.delete({ where: { id: bookingId } });

  return { id: bookingId };
};
