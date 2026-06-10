import { getUserBookings } from '../services/user.service.js';

export const listUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await getUserBookings(id);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};
