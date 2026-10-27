import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      console.log(
        `[CampusConnect Server] Running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`
      );
      console.log(`[CampusConnect Server] College configured: ${ENV.COLLEGE_NAME}`);
      if (ENV.COLLEGE_EMAIL_DOMAIN === 'all' || ENV.COLLEGE_EMAIL_DOMAIN === '*') {
        console.log('[CampusConnect Server] Domain restriction: UNRESTRICTED (Development only)');
      } else if (ENV.COLLEGE_EMAIL_DOMAIN) {
        const cleanDomain = ENV.COLLEGE_EMAIL_DOMAIN.replace(/^@+/, '');
        console.log(`[CampusConnect Server] Domain restricted to: @${cleanDomain}`);
      } else {
        console.log('[CampusConnect Server] Domain restriction: NONE CONFIGURED');
      }
    });

    // Handle unhandled rejections and termination signals
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection Error]: ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('[CampusConnect Server] SIGTERM signal received. Closing gracefully.');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
