import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    service: 'CampusConnect API',
    database: isDbConnected ? 'connected' : 'disconnected',
  });
});

export default router;
