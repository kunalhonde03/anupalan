import Fastify from 'fastify';
import cors from '@fastify/cors';
import { clock } from '@anupalan/engine';

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'anupalan-api',
    currentTime: clock.now().toISOString(),
  };
});

const start = async () => {
  try {
    const port = Number(process.env.API_PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[ANUPALAN API] Listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
