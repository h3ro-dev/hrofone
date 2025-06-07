import { Router } from 'express';
import authRoutes from './auth.routes';
import consultationRoutes from './consultation.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/consultations', consultationRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'HR of One API v1',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      consultations: '/api/v1/consultations',
    },
  });
});

export default router; 