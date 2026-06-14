import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = express.Router();

// Get dashboard statistics (accessible to all authenticated users; logic handles roles internally)
router.get('/summary', protect, getDashboardSummary);

export default router;
