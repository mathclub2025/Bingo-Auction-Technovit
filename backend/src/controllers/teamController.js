import {
  getAllTeamsList,
  findTeamById,
  findTeamByName,
  updateTeamData,
  insertScoreAuditLog,
  getScoreAuditLogs,
  resetAllTeamsToInitial
} from '../services/teamStore.js';
import { broadcastTeamUpdate, broadcastAllTeams, broadcastAlert } from '../services/socketService.js';

/**
 * GET /api/teams
 * View all teams with coins and numbers collected (Sorted by coins descending)
 * Accessible to Teams (Read-Only) and Public
 */
export async function getTeams(req, res) {
  try {
    const teams = await getAllTeamsList();
    return res.json({
      success: true,
      teams: teams.filter(t => t.role === 'team')
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/teams/:id
 * Get single team status
 */
export async function getTeamById(req, res) {
  try {
    const { id } = req.params;
    const team = await findTeamById(id);
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    const { password_hash, ...safeData } = team;
    return res.json({ success: true, team: safeData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/teams/admin/update
 * Admin / Source Computer Only: Updates team coins, bonus, and numbers collected
 *
 * Payload:
 * - teamId (or teamName)
 * - coinsDeducted (number)
 * - isQuestionAnswered (boolean: true/false or string 'yes'/'no')
 * - bonusCoins (number, if answered yes)
 * - numberObtained (number, if answered yes)
 */
export async function updateTeamPoints(req, res) {
  try {
    const {
      teamId,
      teamName,
      coinsDeducted = 0,
      isQuestionAnswered = false,
      answerStatus,
      bonusCoins = 0,
      bonusAdded = 0,
      numberObtained = null,
      numberWon = null
    } = req.body;

    let team = null;
    if (teamId) {
      team = await findTeamById(teamId);
    } else if (teamName) {
      team = await findTeamByName(teamName);
    }

    if (!team) {
      return res.status(404).json({ error: 'Target team not found. Please select a valid team.' });
    }

    const prevCoins = Number(team.coins) || 0;
    const deduction = Math.max(0, Number(coinsDeducted) || 0);

    // Normalize answer status
    const isYes = isQuestionAnswered === true ||
                  isQuestionAnswered === 'yes' ||
                  answerStatus === 'yes';

    const bonus = isYes ? Math.max(0, Number(bonusCoins || bonusAdded) || 0) : 0;
    const targetNumber = isYes ? (numberObtained !== null ? numberObtained : numberWon) : null;

    // Calculate new coins (never below 0)
    const newCoins = Math.max(0, prevCoins - deduction + bonus);

    // Update numbers collected if answered yes and number provided
    let updatedNumbers = Array.isArray(team.numbers_collected) ? [...team.numbers_collected] : [];
    let numberAdded = null;

    if (isYes && targetNumber !== null && targetNumber !== undefined && String(targetNumber).trim() !== '') {
      const numVal = isNaN(Number(targetNumber)) ? String(targetNumber).trim() : Number(targetNumber);
      if (!updatedNumbers.includes(numVal)) {
        updatedNumbers.push(numVal);
        numberAdded = numVal;
      }
    }

    // Update team in database
    const updatedTeam = await updateTeamData(team.id, {
      coins: newCoins,
      numbers_collected: updatedNumbers
    });

    const { password_hash, ...safeUpdatedTeam } = updatedTeam;

    // Log in score_audit_logs table
    const auditLog = await insertScoreAuditLog({
      teamId: team.id,
      coinsDeducted: deduction,
      bonusAdded: bonus,
      numberWon: numberAdded,
      answerStatus: isYes ? 'yes' : 'no',
      previousCoins: prevCoins,
      newCoins: newCoins
    });

    // Realtime broadcast via Socket.io
    broadcastTeamUpdate(safeUpdatedTeam, {
      auditLog,
      deduction,
      bonus,
      numberAdded
    });

    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams.filter(t => t.role === 'team'));

    // Realtime alert
    broadcastAlert({
      type: isYes ? 'success' : 'deduction',
      teamName: team.team_name,
      message: isYes
        ? `🎉 ${team.team_name} answered correctly! Deducted: -${deduction.toLocaleString()} | Bonus: +${bonus.toLocaleString()}${numberAdded !== null ? ` | Number Won: #${numberAdded}` : ''}`
        : `⚠️ ${team.team_name} deducted -${deduction.toLocaleString()} coins.`,
      teamId: team.id
    });

    return res.json({
      success: true,
      message: `Successfully updated ${team.team_name}`,
      team: safeUpdatedTeam,
      auditLog
    });
  } catch (err) {
    console.error('Update team points error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * POST /api/teams/admin/reset-all
 * Admin Only: Reset all teams back to 50,000 coins and 0 numbers
 */
export async function resetAllTeams(req, res) {
  try {
    const resetTeams = await resetAllTeamsToInitial();
    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams.filter(t => t.role === 'team'));

    return res.json({
      success: true,
      message: 'All teams successfully reset to initial 50,000 coins.',
      teams: resetTeams
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/teams/admin/logs
 * Admin Only: View score audit logs
 */
export async function getAuditLogs(req, res) {
  try {
    const logs = await getScoreAuditLogs();
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
