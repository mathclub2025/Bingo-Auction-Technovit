import express from 'express';
import {
  getTeams,
  getTeamById,
  updateTeamPoints,
  resetAllTeams,
  getAuditLogs,
  addTeamMember,
  awardRoundBonus,
  resolveLevel5,
  resolveLevel4,
  deleteTeam,
  clearDatabase
} from '../controllers/teamController.js';

const router = express.Router();

// Public & Team View Routes
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.delete('/:id', deleteTeam);
router.post('/:id/members', addTeamMember);

// Admin Control Desk Routes
router.post('/admin/update', updateTeamPoints);
router.post('/admin/award-round-bonus', awardRoundBonus);
router.post('/admin/resolve-level-4', resolveLevel4);
router.post('/admin/resolve-level-5', resolveLevel5);
router.post('/admin/delete', deleteTeam);
router.post('/admin/clear-database', clearDatabase);
router.post('/admin/reset-all', resetAllTeams);
router.get('/admin/logs', getAuditLogs);

export default router;