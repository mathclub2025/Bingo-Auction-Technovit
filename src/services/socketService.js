let ioInstance = null;

export function setupSocketService(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

    socket.on('join', ({ role, teamName, teamId }) => {
      socket.join('auction_arena');
      if (teamId) {
        socket.join(`team_${teamId}`);
      }
      if (role === 'admin') {
        socket.join('admin_room');
      }
      console.log(`👥 [Socket] ${teamName || role || 'Visitor'} joined auction arena.`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

export function broadcastTeamUpdate(team, details = {}) {
  if (!ioInstance) return;
  ioInstance.to('auction_arena').emit('team_updated', {
    team,
    details,
    timestamp: new Date().toISOString()
  });
}

export function broadcastAllTeams(teams) {
  if (!ioInstance) return;
  ioInstance.to('auction_arena').emit('all_teams_updated', {
    teams,
    timestamp: new Date().toISOString()
  });
}

export function broadcastAlert(alertData) {
  if (!ioInstance) return;
  ioInstance.to('auction_arena').emit('point_alert', alertData);
}

export function getIO() {
  return ioInstance;
}
