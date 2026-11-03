import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';

async function bootstrap() {
  const app = createApp();

  // Test database connection on startup
  try {
    await connectDatabase();
  } catch (error) {
    console.warn('⚠️ Warning: Database connection failed during startup.');
    console.warn('   Ensure MySQL is running (e.g. docker-compose up mysql)');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`
🚀 ========================================================
   Node.js + TypeScript SQL Backend is running!
   Environment: ${env.NODE_ENV}
   Server URL:  http://localhost:${env.PORT}
   Health:      http://localhost:${env.PORT}/api/health
   Base API:    http://localhost:${env.PORT}/api/v1
========================================================
    `);
  });

  // Graceful Shutdown
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

      server.close(async () => {
        console.log('🔒 Closed out remaining connections.');
        try {
          await disconnectDatabase();
          console.log('✅ Graceful shutdown completed cleanly.');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during database disconnect:', err);
          process.exit(1);
        }
      });

      // Force close if graceful shutdown takes longer than 10 seconds
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });
  }
}

bootstrap().catch((error) => {
  console.error('❌ Fatal error during server startup:', error);
  process.exit(1);
});
