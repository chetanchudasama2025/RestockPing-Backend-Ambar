import { Router } from 'express';
import { teamLogin, teamScan, teamSend, teamLogs, teamDashboard, verifyTeamSession } from '../controllers/teamController';
import { pinRateLimit, scanRateLimit } from '../middleware/throttle';

const router = Router();

// POST /api/team/login - PIN authentication
router.post('/login', pinRateLimit, teamLogin);

// POST /api/team/scan - Lookup label by code/ID (requires authentication)
router.post('/scan', scanRateLimit, verifyTeamSession, teamScan);

// POST /api/team/send - Send alert to subscribers of a label (requires authentication)
router.post('/send', verifyTeamSession, teamSend);

// GET /api/team/logs - View audit logs (requires authentication)
router.get('/logs', verifyTeamSession, teamLogs);

// GET /api/team/dashboard - Get live team metrics (requires authentication)
router.get('/dashboard', verifyTeamSession, teamDashboard);

export default router;
