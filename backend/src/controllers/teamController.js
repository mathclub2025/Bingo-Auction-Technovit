import {
  getAllTeamsList,
  findTeamById,
  findTeamByName,
  updateTeamData,
  insertScoreAuditLog,
  getScoreAuditLogs,
  resetAllTeamsToInitial,
  addMemberToTeam,
  addCoinsToAllTeams,
  enrichTeamWithBingo,
  deleteTeamById,
  clearEntireDatabaseFromStore
} from '../services/teamStore.js';
import {
  broadcastTeamUpdate,
  broadcastAllTeams,
  broadcastAlert,
  broadcastTeamsUpdate,
  broadcastBingoWinner,
  broadcastBingoWarning,
  resetBingoWarnings
} from '../services/socketService.js';
import { LEVEL_CONFIG } from '../data/questionBank.js';

/**
 * GET /api/teams
 * View all teams with coins and numbers collected (Sorted by coins descending)
 */
export async function getTeams(req, res) {
  try {
    const teams = await getAllTeamsList();
    return res.json({
      success: true,
      teams: teams
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/teams/:id/members
 * Add a new teammate to team_members
 */
export async function addTeamMember(req, res) {
  try {
    const { id } = req.params;
    const { name, regNo, role = 'Teammate' } = req.body;

    if (!name || !regNo) {
      return res.status(400).json({ error: 'Teammate name and registration number are required.' });
    }

    const result = await addMemberToTeam({ teamId: id, name, regNo, role });
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to add teammate to team.' });
    }

    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams);

    return res.status(201).json({
      success: true,
      message: `Added ${name} (${regNo}) to team`,
      member: result.member,
      allTeams
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
 * Admin point updates (coins can go negative)
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

    const isYes = isQuestionAnswered === true ||
      isQuestionAnswered === 'yes' ||
      answerStatus === 'yes';

    const bonus = isYes ? Math.max(0, Number(bonusCoins || bonusAdded) || 0) : 0;
    const targetNumber = isYes ? (numberObtained !== null ? numberObtained : numberWon) : null;

    const newCoins = prevCoins - deduction + bonus;

    let updatedNumbers = Array.isArray(team.numbers_collected) ? [...team.numbers_collected] : [];
    let numberAdded = null;

    if (isYes && targetNumber !== null && targetNumber !== undefined && String(targetNumber).trim() !== '') {
      const numVal = isNaN(Number(targetNumber)) ? String(targetNumber).trim() : Number(targetNumber);
      if (!updatedNumbers.includes(numVal)) {
        updatedNumbers.push(numVal);
        numberAdded = numVal;
      }
    }

    const updatedTeam = await updateTeamData(team.id, {
      coins: newCoins,
      numbers_collected: updatedNumbers
    });

    const { password_hash, ...safeUpdatedTeam } = updatedTeam;

    const auditLog = await insertScoreAuditLog({
      teamId: team.id,
      coinsDeducted: deduction,
      bonusAdded: bonus,
      numberWon: numberAdded,
      answerStatus: isYes ? 'yes' : 'no',
      previousCoins: prevCoins,
      newCoins: newCoins
    });

    if (safeUpdatedTeam.isWinner) {
      broadcastBingoWinner(safeUpdatedTeam);
    } else if (safeUpdatedTeam.requiredNumbers && safeUpdatedTeam.requiredNumbers.length > 0 && numberAdded) {
      broadcastBingoWarning(safeUpdatedTeam);
    }

    broadcastTeamUpdate(safeUpdatedTeam, {
      auditLog,
      deduction,
      bonus,
      numberAdded
    });

    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams);
    broadcastTeamsUpdate(allTeams, safeUpdatedTeam);

    broadcastAlert({
      type: isYes ? 'success' : 'deduction',
      teamName: team.team_name,
      message: isYes
        ? `${team.team_name} answered correctly. Deducted: -${deduction.toLocaleString()} | Bonus: +${bonus.toLocaleString()}${numberAdded !== null ? ` | Number Won: #${numberAdded}` : ''}`
        : `${team.team_name} deducted -${deduction.toLocaleString()} coins.`,
      teamId: team.id
    });

    return res.json({
      success: true,
      message: `Successfully updated ${team.team_name}`,
      team: safeUpdatedTeam,
      allTeams,
      auditLog
    });
  } catch (err) {
    console.error('Update team points error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * POST /api/teams/admin/award-round-bonus
 * Admin Button: Add 250 coins to EVERY registered team
 */
export async function awardRoundBonus(req, res) {
  try {
    const bonusAmount = Number(req.body.amount) || 250;
    await addCoinsToAllTeams(bonusAmount);
    const allTeams = await getAllTeamsList();

    broadcastAllTeams(allTeams);
    broadcastTeamsUpdate(allTeams);
    broadcastAlert({
      type: 'bonus_round',
      teamName: 'All Teams',
      message: `Round Bonus: +${bonusAmount} Coins added to all teams.`
    });

    return res.json({
      success: true,
      message: `Successfully added ${bonusAmount} coins to all registered teams`,
      teams: allTeams
    });
  } catch (err) {
    console.error('Award round bonus error:', err);
    return res.status(500).json({ error: err.message || 'Failed to award round bonus' });
  }
}

/**
 * POST /api/teams/admin/resolve-level-5
 * Admin form for resolving offline Level 5 Dares/Puzzles
 */
export async function resolveLevel5(req, res) {
  try {
    const {
      teamId,
      amountBidded = 0,
      isAnswerCorrect = false,
      numberBidded = null,
      bonusCoins = 5000
    } = req.body;

    const team = await findTeamById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const isCorrect = isAnswerCorrect === true || isAnswerCorrect === 'yes';
    const bidAmount = Math.max(0, Number(amountBidded) || 0);
    const bonus = isCorrect ? Math.max(0, Number(bonusCoins) || 5000) : 0;
    const prevCoins = Number(team.coins) || 0;
    const newCoins = prevCoins - bidAmount + bonus;

    let updatedNumbers = Array.isArray(team.numbers_collected) ? [...team.numbers_collected] : [];
    let numberAdded = null;

    if (isCorrect && numberBidded !== null && numberBidded !== undefined && String(numberBidded).trim() !== '') {
      const numVal = Number(numberBidded);
      if (!isNaN(numVal) && !updatedNumbers.includes(numVal)) {
        updatedNumbers.push(numVal);
        numberAdded = numVal;
      }
    }

    const updatedTeam = await updateTeamData(team.id, {
      coins: newCoins,
      numbers_collected: updatedNumbers
    });

    await insertScoreAuditLog({
      teamId: team.id,
      coinsDeducted: bidAmount,
      bonusAdded: bonus,
      numberWon: numberAdded,
      answerStatus: isCorrect ? 'yes' : 'no',
      previousCoins: prevCoins,
      newCoins: newCoins
    });

    if (updatedTeam.isWinner) {
      broadcastBingoWinner(updatedTeam);
    } else if (updatedTeam.requiredNumbers && updatedTeam.requiredNumbers.length > 0 && numberAdded) {
      broadcastBingoWarning(updatedTeam);
    }

    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams);
    broadcastTeamsUpdate(allTeams, updatedTeam);
    broadcastTeamUpdate(updatedTeam);

    broadcastAlert({
      type: isCorrect ? 'success' : 'deduction',
      teamName: team.team_name,
      message: isCorrect
        ? `Level 5 Passed: ${team.team_name} deducted ${bidAmount} and gained +${bonus} bonus${numberAdded ? ` and Number #${numberAdded}` : ''}.`
        : `Level 5 Missed: ${team.team_name} deducted ${bidAmount} coins.`
    });

    return res.json({
      success: true,
      message: `Level 5 settled for ${team.team_name}`,
      team: updatedTeam,
      allTeams
    });
  } catch (err) {
    console.error('Resolve level 5 error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/teams/admin/reset-all
 * Admin Only: Reset all teams back to 50,000 coins and 0 numbers
 */
export async function resetAllTeams(req, res) {
  try {
    await resetAllTeamsToInitial();
    resetBingoWarnings();
    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams);
    broadcastTeamsUpdate(allTeams);

    return res.json({
      success: true,
      message: 'All teams successfully reset to initial 50,000 coins.',
      teams: allTeams
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

/**
 * DELETE /api/teams/:id or POST /api/teams/admin/delete
 * Remove a specific team from the database
 */
export async function deleteTeam(req, res) {
  try {
    const teamId = req.params.id || req.body.teamId;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required.' });
    }

    const team = await findTeamById(teamId);
    const teamName = team ? team.team_name : teamId;

    await deleteTeamById(teamId);
    const allTeams = await getAllTeamsList();
    broadcastAllTeams(allTeams);
    broadcastTeamsUpdate(allTeams);
    broadcastAlert({
      type: 'deduction',
      teamName: teamName,
      message: `Team "${teamName}" was removed from the tournament.`
    });

    return res.json({
      success: true,
      message: `Team "${teamName}" successfully removed.`,
      allTeams
    });
  } catch (err) {
    console.error('Delete team error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete team.' });
  }
}

/**
 * POST /api/teams/admin/clear-database
 * Clear all teams, team members, and score audit logs
 */
export async function clearDatabase(req, res) {
  try {
    await clearEntireDatabaseFromStore();
    resetBingoWarnings();
    broadcastAllTeams([]);
    broadcastTeamsUpdate([]);
    broadcastAlert({
      type: 'bonus_round',
      teamName: 'Admin',
      message: 'Tournament database cleared successfully.'
    });

    return res.json({
      success: true,
      message: 'Entire tournament database cleared successfully. Admin login preserved.',
      allTeams: []
    });
  } catch (err) {
    console.error('Clear database error:', err);
    return res.status(500).json({ error: err.message || 'Failed to clear database.' });
  }
}

export const resolveLevel4 = resolveLevel5;