let globalIo = null;

/**
 * Setup Socket.io Realtime Service
 */
export function setupSocketService(io) {
  globalIo = io;

  io.on('connection', (socket) => {
    console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

    // Subscribe client to real-time math club room
    socket.on('join_dashboard', ({ teamName, role }) => {
      socket.join('dashboard');
      console.log(`👥 [Dashboard] ${teamName || 'Guest'} (${role || 'viewer'}) joined real-time updates.`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });
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
    console.log('📡 [Socket.io] Broadcasted teams update to all connected dashboards.');
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
    console.log(`📡 [Socket.io] Broadcasted update for team ${updatedTeam?.team_name || updatedTeam?.id}`);
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
    console.log(`📡 [Socket.io] Broadcasted alert: ${alertData.message}`);
  }
}

