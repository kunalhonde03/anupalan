import type { FastifyPluginAsync } from 'fastify';
import { store } from '../store.js';

export const alertsRoutes: FastifyPluginAsync = async (app) => {
  // List current alerts with "Why this alert?" panel data
  app.get('/', async () => {
    return {
      alerts: store.alerts,
      count: store.alerts.length,
      followUpsSavedCount: store.followUpsSavedCount,
    };
  });

  // Server-Sent Events (SSE) for live alert streaming (Demo Step 5)
  app.get('/stream', async (req, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    // Send initial snapshot
    reply.raw.write(`data: ${JSON.stringify({ type: 'SNAPSHOT', alerts: store.alerts, followUpsSaved: store.followUpsSavedCount })}\n\n`);

    // Heartbeat every 10 seconds
    const interval = setInterval(() => {
      reply.raw.write(`data: ${JSON.stringify({ type: 'PING', alertsCount: store.alerts.length })}\n\n`);
    }, 10000);

    req.raw.on('close', () => {
      clearInterval(interval);
    });
  });
};
