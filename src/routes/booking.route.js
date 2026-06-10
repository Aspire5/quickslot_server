import { Router } from 'express';
import { bookSlot, deleteBooking } from '../controllers/booking.controller.js';

const router = Router();

router.post('/', bookSlot);
router.delete('/:id', deleteBooking);

export default router;
