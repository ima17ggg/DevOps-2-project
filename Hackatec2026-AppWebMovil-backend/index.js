// Start the Express server
import('./src/server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});