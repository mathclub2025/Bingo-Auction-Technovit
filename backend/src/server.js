import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { setupSocketService } from './services/socketService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Check potential frontend build paths (Render full-stack deployment or local build)
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, './public'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist')
];

let frontendDistPath = possibleDistPaths.find(p => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

if (frontendDistPath) {
  console.log(`📦 [Frontend] Serving static UI from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA Catch-all: Route all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // API Only root fallback
  app.get('/', (req, res) => {
    res.json({
      message: 'Math Club Auction Arena API Server',
      status: 'online',
      version: '1.0.0'
    });
  });

  // Helpful 404 handler for SPA routes if opened directly on API-only backend
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Math Club Auction API</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>Math Club Auction Backend API Server</h2>
          <p>You requested <code>${req.path}</code> which is a frontend page route.</p>
          <p>Please access the dashboard through your live frontend deployment (e.g. Vercel) or ensure the frontend build is generated.</p>
          <p><a href="/health">Check Backend Health (/health)</a></p>
        </body>
      </html>
    `);
  });
}

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 [Server] Math Club Auction Backend running on http://localhost:${PORT}`);
  console.log(`📡 [Socket.io] Realtime WebSocket gateway active`);
});

