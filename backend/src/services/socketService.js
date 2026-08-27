import { getEligibleLevels, getNextQuestionForLevel, verifyAnswer, LEVEL_CONFIG } from '../data/questionBank.js';
import { findTeamById, updateTeamData, getAllTeamsList, insertScoreAuditLog, addCoinsToAllTeams } from './teamStore.js';

let globalIo = null;

/**
 * Setup Socket.io Realtime Service
 */
export function setupSocketService(io) {
  globalIo = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room
    socket.on('join_dashboard', ({ teamId, teamName, role }) => {
      socket.join('dashboard');
      if (teamId) {
        socket.join(`team_${teamId}`);
        console.log(`[Room] Team ${teamName || teamId} joined private channel team_${teamId}`);
      }
      if (role === 'admin') {
        socket.join('admin_room');
        console.log(`[Room] Admin joined admin_room channel`);
      }
    });

    // 1. ADMIN SENDS QUESTION TO A TEAM
    socket.on('admin:send_question', async ({ teamId, initialBid, finalBid, numberBidded }) => {
      try {
        const team = await findTeamById(teamId);
        if (!team) return;

        const initBid = Math.max(0, Number(initialBid) || 0);
        const finBid = Math.max(0, Number(finalBid) || 0);
        const numBidded = Number(numberBidded) || null;
        const delta = Math.max(0, finBid - initBid);
        const eligibleLevels = getEligibleLevels(initBid, finBid);

        const payload = {
          teamId: team.id,
          teamName: team.team_name,
          initialBid: initBid,
          finalBid: finBid,
          delta,
          eligibleLevels,
          numberBidded: numBidded,
          timestamp: new Date().toISOString()
        };

        io.to(`team_${team.id}`).emit('auction:question_offered', payload);
        io.emit('auction:team_question_offered', payload);

        console.log(`[Auction] Question offered to ${team.team_name} (Delta: ${delta}, Levels: ${eligibleLevels.join(', ')})`);
      } catch (err) {
        console.error('Error in admin:send_question:', err);
      }
    });

    // 2. TEAM SELECTS A LEVEL
    socket.on('team:select_level', async ({ teamId, level, finalBid, numberBidded, initialBid }) => {
      try {
        const team = await findTeamById(teamId);
        if (!team) return;

        const selectedLevel = Number(level);
        const finBid = Number(finalBid) || 0;
        const initBid = Number(initialBid) || 0;
        const numBidded = Number(numberBidded) || null;

        if (selectedLevel === 5) {
          // LEVEL 5 SPECIAL FLOW: PPT Display
          io.to(`team_${team.id}`).emit('auction:level_5_ppt', {
            teamId: team.id,
            teamName: team.team_name,
            finalBid: finBid,
            numberBidded: numBidded,
            message: 'Please refer the ppt question displayed'
          });

          // Notify Admin
          io.to('admin_room').emit('auction:admin_level_5_pending', {
            teamId: team.id,
            teamName: team.team_name,
            finalBid: finBid,
            numberBidded: numBidded,
            timestamp: new Date().toISOString()
          });

          console.log(`[Auction] Team ${team.team_name} chose Level 5 (PPT Dare/Puzzle Mode)`);
          return;
        }

        // LEVEL 1 - 4: Pick random question from pool
        const questionData = getNextQuestionForLevel(selectedLevel);
        if (!questionData) return;

        const questionPayload = {
          teamId: team.id,
          teamName: team.team_name,
          questionId: questionData.id,
          level: selectedLevel,
          question: questionData.question,
          options: questionData.options,
          timerSeconds: questionData.timerSeconds,
          bonusCoins: questionData.bonusCoins,
          finalBid: finBid,
          numberBidded: numBidded,
          startedAt: Date.now()
        };

        io.to(`team_${team.id}`).emit('auction:question_started', questionPayload);
        io.emit('auction:active_question_started', questionPayload);

        console.log(`[Auction] Question started for ${team.team_name} (Level ${selectedLevel}, Timer: ${questionData.timerSeconds}s)`);
      } catch (err) {
        console.error('Error in team:select_level:', err);
      }
    });

    // 3. TEAM SUBMITS ANSWER (OR TIMES OUT)
    socket.on('team:submit_answer', async ({ teamId, questionId, selectedOption, isTimeout, finalBid, numberBidded, level }) => {
      try {
        const team = await findTeamById(teamId);
        if (!team) return;

        const finBid = Math.max(0, Number(finalBid) || 0);
        const numBidded = numberBidded !== null && numberBidded !== undefined && String(numberBidded).trim() !== '' ? Number(numberBidded) : null;
        const targetLevel = Number(level) || 1;
        const config = LEVEL_CONFIG[targetLevel] || LEVEL_CONFIG[1];

        const isCorrect = !isTimeout && verifyAnswer(questionId, selectedOption);
        const bonus = isCorrect ? config.bonusCoins : 0;
        const prevCoins = Number(team.coins) || 0;
        const newCoins = prevCoins - finBid + bonus;

        let updatedNumbers = Array.isArray(team.numbers_collected) ? [...team.numbers_collected] : [];
        let numberAdded = null;

        if (isCorrect && numBidded !== null && !isNaN(numBidded)) {
          if (!updatedNumbers.includes(numBidded)) {
            updatedNumbers.push(numBidded);
            numberAdded = numBidded;
          }
        }

        const updatedTeam = await updateTeamData(team.id, {
          coins: newCoins,
          numbers_collected: updatedNumbers
        });

        await insertScoreAuditLog({
          teamId: team.id,
          coinsDeducted: finBid,
          bonusAdded: bonus,
          numberWon: numberAdded,
          answerStatus: isCorrect ? 'yes' : 'no',
          previousCoins: prevCoins,
          newCoins: newCoins
        });

        const resultPayload = {
          teamId: team.id,
          teamName: team.team_name,
          isCorrect,
          isTimeout: Boolean(isTimeout),
          selectedOption,
          coinsDeducted: finBid,
          bonusAdded: bonus,
          numberWon: numberAdded,
          newCoins,
          team: updatedTeam
        };

        io.to(`team_${team.id}`).emit('auction:question_result', resultPayload);
        io.emit('auction:round_completed', resultPayload);

        // Check if team won Bingo or reached 1-Number-Away Warning!
        if (updatedTeam && updatedTeam.isWinner) {
          broadcastBingoWinner(updatedTeam);
        } else if (updatedTeam && Array.isArray(updatedTeam.requiredNumbers) && updatedTeam.requiredNumbers.length > 0 && numberAdded) {
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
            ? `${team.team_name} answered correctly. Deducted: -${finBid.toLocaleString()} | Bonus: +${bonus.toLocaleString()}${numberAdded !== null ? ` | Won Number #${numberAdded}` : ''}`
            : `${team.team_name} missed the challenge. Deducted -${finBid.toLocaleString()} coins.`
        });
      } catch (err) {
        console.error('Error in team:submit_answer:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

/**
 * Broadcast Bingo Winner Celebration across all screens
 */
export function broadcastBingoWinner(winnerTeam) {
  if (globalIo) {
    globalIo.emit('bingo:winner', {
      teamId: winnerTeam.id,
      teamName: winnerTeam.team_name || winnerTeam.name,
      message: `Team ${winnerTeam.team_name || winnerTeam.name} has won the bingo auction arena event`,
      timestamp: new Date().toISOString()
    });
    console.log(`[BINGO WINNER] Team ${winnerTeam.team_name} has won the tournament.`);
  }
}

/**
 * Broadcast Bingo 1-Number-Away Warning across all screens
 */
export function broadcastBingoWarning(team) {
  if (globalIo && team) {
    const requiredNumbers = Array.isArray(team.requiredNumbers) ? team.requiredNumbers : [];
    if (requiredNumbers.length > 0 && !team.isWinner) {
      globalIo.emit('bingo:required_number_warning', {
        teamId: team.id,
        teamName: team.team_name || team.name,
        requiredNumbers: requiredNumbers,
        bingoCardSet: team.bingo_card_set || 1,
        message: `${team.team_name || team.name} requires number${requiredNumbers.length > 1 ? 's' : ''} ${requiredNumbers.map(n => '#' + n).join(', ')} to WIN Bingo!`,
        timestamp: new Date().toISOString()
      });
      console.log(`[BINGO WARNING] Team ${team.team_name || team.name} needs ${requiredNumbers.join(', ')} to win!`);
    }
  }
}

/**
 * Broadcast team updates globally to all connected dashboards
 */
export function broadcastTeamsUpdate(teamsList, updatedTeamInfo = null) {
  if (globalIo) {
    globalIo.emit('teams:updated', {
      teams: teamsList,
      updatedTeam: updatedTeamInfo,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Broadcast single team update
 */
export function broadcastTeamUpdate(updatedTeam, extraData = {}) {
  if (globalIo) {
    globalIo.emit('team:updated', {
      team: updatedTeam,
      ...extraData,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Broadcast entire teams list
 */
export function broadcastAllTeams(teamsList) {
  if (globalIo) {
    globalIo.emit('teams:all', {
      teams: teamsList,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Broadcast real-time alert/notification
 */
export function broadcastAlert(alertData) {
  if (globalIo) {
    globalIo.emit('alert:new', {
      ...alertData,
      timestamp: new Date().toISOString()
    });
  }
}
