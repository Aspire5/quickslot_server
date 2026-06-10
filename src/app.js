import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.route.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Apply Middlewares
// HACKATHON SETUP: Allow all origins. 
// PRODUCTION RESTRICTION: To restrict origins later, pass config:
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://yourdomain.com'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));
app.use(cors()); 

app.use(express.json());

// Routes
app.use('/api/v1/health', healthRouter);

// Global Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
