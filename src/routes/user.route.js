import { Router } from 'express';
import { listUserBookings } from '../controllers/user.controller.js';

const router = Router();

router.get('/:id/bookings', listUserBookings);

export default router;
