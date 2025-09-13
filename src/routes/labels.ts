import { Router } from 'express';
import { getLabels } from '../controllers/labelsController';
import { lenientThrottle } from '../middleware/throttle';

const router = Router();

// GET /api/labels?query=string&limit=10
router.get('/', lenientThrottle, getLabels);

export default router;


