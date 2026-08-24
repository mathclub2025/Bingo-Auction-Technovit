import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { setupSocketService } from './services/socketService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Setup Socket.io Real-Time Gateway
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setupSocketService(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

// Root / Health Check
app.get('/', (req, res) => {
  res.json({
    service: 'Math Club Auction Arena API',
    status: 'online',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      teams: '/api/teams'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 [Server] Math Club Auction Backend running at http://localhost:${PORT}`);
  console.log(`📡 [Socket.io] Realtime WebSocket gateway active`);
});
