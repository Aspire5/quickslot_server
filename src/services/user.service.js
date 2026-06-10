import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const getUserBookings = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return prisma.booking.findMany({
    where: { userId },
    include: {
      slot: {
        include: {
          venue: { select: { id: true, name: true, location: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
