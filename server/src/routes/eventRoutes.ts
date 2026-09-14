import { Router } from 'express';
import {
  getEvents,
  updateEventStatus,
  getMissionSummary,
  toggleSimulation,
} from '../controllers/eventController';

const router = Router();

// GET /api/events - Filterable events history list
router.get('/events', getEvents);

// PATCH /api/events/:id/status - Update event status (ACKNOWLEDGED / RESOLVED)
router.patch('/events/:id/status', updateEventStatus);

// GET /api/mission/summary - Mission overview statistics & bounding box
router.get('/mission/summary', getMissionSummary);

// POST /api/simulation/toggle - Toggle Demo Mode
router.post('/simulation/toggle', toggleSimulation);

export default router;
