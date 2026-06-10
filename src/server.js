import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/prisma.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Express Server] Running on http://localhost:${PORT}`);
});

// Handle graceful shutdown processes
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
  
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('[Prisma] Client successfully disconnected.');
    } catch (err) {
      console.error('[Prisma] Error during disconnection:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
