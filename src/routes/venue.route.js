import { Router } from 'express';
import { listVenues, getVenueSlots } from '../controllers/venue.controller.js';

const router = Router();

router.get('/', listVenues);
router.get('/:id/slots', getVenueSlots);

export default router;
