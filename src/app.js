import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.route.js';
import venueRouter from './routes/venue.route.js';
import bookingRouter from './routes/booking.route.js';
import userRouter from './routes/user.route.js';
import { auth } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// public routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/venues', venueRouter);

// protected routes — require valid JWT
app.use('/api/v1/bookings', auth, bookingRouter);
app.use('/api/v1/users', auth, userRouter);

app.use(errorHandler);

export default app;
