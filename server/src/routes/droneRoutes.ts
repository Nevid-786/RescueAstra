import { Router } from 'express';
import { postDroneEvents, getDroneStatus } from '../controllers/droneController';

const router = Router();

// POST /api/drone/events - Telemetry update from drone/intelligence system
router.post('/events', postDroneEvents);

// GET /api/drone/status - Current position and connectivity
router.get('/status', getDroneStatus);

export default router;
