import Fastify from 'fastify';
import cors from '@fastify/cors';
import { clock } from '@anupalan/engine';
import { authRoutes } from './routes/auth.js';
import { timeMachineRoutes } from './routes/time-machine.js';
import { rulesRoutes } from './routes/rules.js';
import { applicationsRoutes } from './routes/applications.js';
import { evcRoutes } from './routes/evc.js';
import { readinessAndDecisionRoutes } from './routes/readiness-and-decision.js';
import { obligationsRoutes } from './routes/obligations.js';
import { auditRoutes } from './routes/audit.js';
import { alertsRoutes } from './routes/alerts.js';
import { analyticsRoutes } from './routes/analytics.js';

const app = Fastify({
  logger: process.env.NODE_ENV === 'development',
});

// Register Cross-Origin Resource Sharing
app.register(cors, {
  origin: true,
  credentials: true,
});

// Health check endpoint
app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'anupalan-api',
    currentTime: clock.now().toISOString(),
  };
});

// Register Application Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(timeMachineRoutes, { prefix: '/api/time-machine' });
app.register(rulesRoutes, { prefix: '/api/rules' });
app.register(applicationsRoutes, { prefix: '/api/applications' });
app.register(evcRoutes, { prefix: '/api/evc' });
app.register(readinessAndDecisionRoutes, { prefix: '/api/readiness' });
app.register(obligationsRoutes, { prefix: '/api/obligations' });
app.register(auditRoutes, { prefix: '/api/audit' });
app.register(alertsRoutes, { prefix: '/api/alerts' });
app.register(analyticsRoutes, { prefix: '/api/analytics' });

const start = async () => {
  try {
    const port = Number(process.env.API_PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[ANUPALAN API] Running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
