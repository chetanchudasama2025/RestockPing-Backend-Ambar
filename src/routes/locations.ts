import { Router } from 'express';
import { getLocations } from '../controllers/locationsController';
import { lenientThrottle } from '../middleware/throttle';

const router = Router();

// GET /api/locations - Get all locations
router.get('/', lenientThrottle, getLocations);

export default router;
