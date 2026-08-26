import express from 'express';
import {
  getTeams,
  getTeamById,
  updateTeamPoints,
  resetAllTeams,
  getAuditLogs,
  addTeamMember
} from '../controllers/teamController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// PUBLIC & TEAM VIEW ROUTES (Read-Only & Team Operations)
// ============================================================================
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/:id/members', addTeamMember);

// ============================================================================
// ADMIN / SOURCE COMPUTER ROUTES (Role-Based Protected)
// ============================================================================
router.post('/admin/update', authenticateToken, requireAdmin, updateTeamPoints);
router.post('/admin/reset-all', authenticateToken, requireAdmin, resetAllTeams);
router.get('/admin/logs', authenticateToken, requireAdmin, getAuditLogs);

export default router;