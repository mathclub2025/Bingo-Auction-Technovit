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

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setupSocketService(io);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Math Club Auction Arena API Server',
    status: 'online',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Math Club Auction Arena Backend',
    timestamp: new Date().toISOString()
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 [Server] Math Club Auction Backend running on http://localhost:${PORT}`);
  console.log(`📡 [Socket.io] Realtime WebSocket gateway active`);
});

