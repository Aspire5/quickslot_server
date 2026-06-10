import { PrismaClient } from '@prisma/client';

let prismaInstance;

// A Proxy wrapper to lazily initialize PrismaClient only when database queries are made.
// This prevents startup crashes when running "npm run dev" without any defined models.
const prisma = new Proxy({}, {
  get(target, prop) {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' },
        ],
      });

      prismaInstance.$on('query', (e) => {
        console.log(`[Prisma Query] Executing: ${e.query}`);
        console.log(`[Prisma Query] Params: ${e.params}`);
        console.log(`[Prisma Query] Duration: ${e.duration}ms`);
      });
    }
    
    // Bind methods to the instance to preserve context (e.g. for transactions)
    const value = prismaInstance[prop];
    if (typeof value === 'function') {
      return value.bind(prismaInstance);
    }
    return value;
  }
});

export default prisma;
