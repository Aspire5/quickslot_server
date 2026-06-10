import { getAllVenues, getSlotsByVenueAndDate } from '../services/venue.service.js';

export const listVenues = async (req, res, next) => {
  try {
    const venues = await getAllVenues();
    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    next(error);
  }
};

export const getVenueSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const data = await getSlotsByVenueAndDate(id, date);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
