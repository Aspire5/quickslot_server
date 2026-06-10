import { createBooking, cancelBooking } from '../services/booking.service.js';

export const bookSlot = async (req, res, next) => {
  try {
    const { slotId } = req.body;
    const booking = await createBooking(req.userId, slotId);

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await cancelBooking(id, req.userId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
