import express from 'express';
import {
  getTeams,
  getTeamById,
  updateTeamPoints,
  resetAllTeams,
  getAuditLogs,
  addTeamMember,
  awardRoundBonus,
  resolveLevel5
} from '../controllers/teamController.js';

const router = express.Router();

// Public & Team View Routes
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/:id/members', addTeamMember);

// Admin Control Desk Routes
router.post('/admin/update', updateTeamPoints);
router.post('/admin/award-round-bonus', awardRoundBonus);
router.post('/admin/resolve-level-5', resolveLevel5);
router.post('/admin/reset-all', resetAllTeams);
router.get('/admin/logs', getAuditLogs);

export default router;