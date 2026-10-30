import type { FastifyPluginAsync } from 'fastify';
import { store } from '../store.js';
import type { Role } from '@anupalan/shared';

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Current user & active scope
  app.get('/me', async () => {
    return {
      user: store.currentUser,
      scope: {
        userId: store.currentUser.id,
        role: store.currentUser.role,
        regionId: store.currentUser.regionId,
        regionName: store.currentUser.regionName,
        institutionId: store.currentUser.institutionId,
        institutionName: store.currentUser.institutionName,
      },
    };
  });

  // List all seeded demo users for instantaneous switching in the UI
  app.get('/users', async () => {
    return {
      users: store.users,
    };
  });

  // Switch role seamlessly during the demo
  app.post<{ Body: { userId?: string; role?: Role } }>('/switch-role', async (req, reply) => {
    const { userId, role } = req.body || {};

    let targetUser = store.users.find((u) => u.id === userId);
    if (!targetUser && role) {
      targetUser = store.users.find((u) => u.role === role);
    }

    if (!targetUser) {
      return reply.code(404).send({ error: 'User or role not found in demo seed.' });
    }

    store.currentUser = targetUser;
    return {
      success: true,
      currentUser: store.currentUser,
    };
  });
};
