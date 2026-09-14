import { Router } from 'express';
import {
  getMissingPersons,
  createMissingPerson,
  updateMissingPersonStatus,
  getMissingPersonStats,
} from '../controllers/missingPersonController';

const router = Router();

// GET /api/missing-persons - List missing persons
router.get('/', getMissingPersons);

// POST /api/missing-persons - Post missing/found person report
router.post('/', createMissingPerson);

// PATCH /api/missing-persons/:id/status - Update status (RESCUED / SIGHTED)
router.patch('/:id/status', updateMissingPersonStatus);

// GET /api/missing-persons/stats - Stats summary
router.get('/stats', getMissingPersonStats);

export default router;
