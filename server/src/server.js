import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { initDatabase } from './db/store.js';
import { syntheticEngine } from './services/syntheticEngine.js';
import { authenticateSocket } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import controlRoutes from './routes/controlRoutes.js';
import ticketsRoutes from './routes/ticketsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import carbonRoutes from './routes/carbonRoutes.js';
import liftsRoutes from './routes/liftsRoutes.js';
import binsRoutes from './routes/binsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import networkRoutes, { cameraPairingTokens, getLanIPv4Addresses, getAutoDetectedTunnelUrl } from './routes/networkRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Section A.3: Trust proxy for HTTPS headers from reverse proxies / tunnels / Vite
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const CLIENT_PORT = 5173;

// Security & Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS allowing localhost, LAN IPs, and tunnel domains with credentials
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    // Dynamic match for localhost, 127.0.0.1, LAN IPs (10.*, 192.168.*, 172.*), and tunnel domains
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Optional Production HTTPS Certificate Loading (Section A.4)
const certsDir = path.join(__dirname, '..', 'certs');
const certPath = path.join(certsDir, 'cert.pem');
const keyPath = path.join(certsDir, 'key.pem');
let server;
let isHttpsServer = false;

if (process.env.HTTPS_SERVER === 'true' && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  server = https.createServer(options, app);
  isHttpsServer = true;
} else {
  server = http.createServer(app);
}

// Setup Socket.IO with Handshake Authentication & Camera Token Scoping (Section C.3)
const io = new SocketIOServer(server, {
  path: '/socket.io',
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
  }
});

io.use(authenticateSocket);

io.on('connection', (socket) => {
  const isCamera = socket.isCameraStreamer;
  const user = socket.user || { role: 'viewer', department: 'Public' };

  if (!isCamera) {
    socket.join(`role:${user.role}`);
    if (user.department) socket.join(`dept:${user.department}`);
  } else {
    socket.join(`camera:${socket.cameraToken}`);
    console.log(`📱 Camera socket authenticated with pairing token: ${socket.cameraToken}`);
  }

  // Section C.3: Restrict camera sockets strictly to camera:* and webrtc:* events
  socket.use(([eventName, ...args], next) => {
    if (socket.isCameraStreamer) {
      if (!eventName.startsWith('camera:') && !eventName.startsWith('webrtc:') && eventName !== 'disconnect') {
        return next(new Error('Access Denied: Camera socket is restricted to camera:* events'));
      }
    }
    next();
  });

  // Client requests initial telemetry state
  socket.on('telemetry:request', () => {
    const data = syntheticEngine.tick();
    socket.emit('telemetry:tick', data);
  });

  // Client updates simulation parameters
  socket.on('sim:update', (params) => {
    if (params) {
      if (params.students !== undefined) syntheticEngine.updateSlider('studentsCount', params.students);
      if (params.attendancePct !== undefined) syntheticEngine.updateSlider('attendancePct', params.attendancePct);
      if (params.faculty !== undefined) syntheticEngine.updateSlider('facultyCount', params.faculty);
      if (params.outdoorTempC !== undefined) syntheticEngine.updateSlider('outdoorTemp', params.outdoorTempC);
      if (params.monsoon !== undefined) syntheticEngine.updateSlider('monsoonMode', params.monsoon);
      if (params.powerCut !== undefined) syntheticEngine.updateSlider('powerCutMode', params.powerCut);
      if (params.speed !== undefined) {
        const mult = parseInt(params.speed) || 1;
        syntheticEngine.setTimeMultiplier(mult);
      }
      const data = syntheticEngine.tick();
      io.emit('telemetry:tick', data);
    }
  });

  // Client changes simulation speed
  socket.on('simulator:set_speed', (speed) => {
    syntheticEngine.setTimeMultiplier(speed);
    io.emit('simulator:speed_changed', speed);
  });

  // Phone camera pairing: Mobile device joins room
  socket.on('camera:join', (data) => {
    const token = data?.token || socket.cameraToken;
    const userAgent = data?.userAgent || 'Mobile Camera';
    if (token) {
      socket.join(`camera:${token}`);
      let pairing = cameraPairingTokens.get(token);
      if (!pairing) {
        pairing = { token, connected: true, userAgent, lastPing: Date.now(), roomId: 'main-204' };
        cameraPairingTokens.set(token, pairing);
      } else {
        pairing.connected = true;
        pairing.userAgent = userAgent;
        pairing.lastPing = Date.now();
      }
      io.emit('camera:phone_connected', {
        token,
        userAgent,
        connectedAt: new Date().toISOString()
      });
      console.log(`📱 Phone camera connected & paired: token=${token}`);
    }
  });

  // Phone camera streams real-time CV detection payload
  socket.on('camera:stream_data', (payload) => {
    const token = payload?.token || socket.cameraToken;
    const { personCount, lightCount, acCount, totalWatts, luxLevel, fps, preview, timestamp } = payload || {};
    if (token) {
      let pairing = cameraPairingTokens.get(token);
      if (!pairing) {
        pairing = {
          token,
          lastCount: Number(personCount) || 0,
          lightCount: Number(lightCount) || 0,
          acCount: Number(acCount) || 0,
          totalWatts: Number(totalWatts) || 0,
          lastPing: Date.now()
        };
        cameraPairingTokens.set(token, pairing);
      } else {
        pairing.lastCount = Number(personCount) || 0;
        pairing.lightCount = Number(lightCount) || 0;
        pairing.acCount = Number(acCount) || 0;
        pairing.totalWatts = Number(totalWatts) || 0;
        pairing.lastPing = Date.now();
      }
      io.emit('camera:phone_update', {
        token,
        personCount: Number(personCount) || 0,
        lightCount: Number(lightCount) || 0,
        acCount: Number(acCount) || 0,
        totalWatts: Number(totalWatts) || 0,
        luxLevel: Number(luxLevel) || 0,
        fps: Number(fps) || 0,
        preview,
        timestamp: timestamp || Date.now()
      });
    }
  });

  // Optional WebRTC Signaling between phone and desktop (Section C.4)
  socket.on('webrtc:offer', (data) => {
    socket.broadcast.emit('webrtc:offer', data);
  });

  socket.on('webrtc:answer', (data) => {
    socket.broadcast.emit('webrtc:answer', data);
  });

  socket.on('webrtc:ice-candidate', (data) => {
    socket.broadcast.emit('webrtc:ice-candidate', data);
  });

  socket.on('camera:stop_broadcast', (data) => {
    const token = data?.token || socket.cameraToken;
    if (token) {
      const pairing = cameraPairingTokens.get(token);
      if (pairing) {
        pairing.lastCount = 0;
        pairing.lightCount = 0;
        pairing.acCount = 0;
        pairing.totalWatts = 0;
      }
      io.emit('camera:phone_disconnected', { token });
    }
  });

  socket.on('disconnect', () => {
    if (socket.isCameraStreamer && socket.cameraToken) {
      const pairing = cameraPairingTokens.get(socket.cameraToken);
      if (pairing) {
        pairing.connected = false;
      }
      io.emit('camera:phone_disconnected', { token: socket.cameraToken });
    }
  });
});

syntheticEngine.setIO(io);

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/lifts', liftsRoutes);
app.use('/api/bins', binsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/camera', networkRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AuraSync Energy Twin Backend',
    institution: 'Dayananda Sagar Academy of Technology and Management (DSATM)',
    developer: 'O(1) Outlaws: AIML Engineers',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Serve static client build if available (Zero-warning HTTP access on port 5000)
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    const host = req.hostname || 'localhost';
    res.redirect(`https://${host}:5173`);
  });
}

// Central Error Handler
app.use(errorHandler);

// Start Server & Synthetic Engine
async function startServer() {
  await initDatabase();
  syntheticEngine.start();

  server.listen(PORT, '0.0.0.0', async () => {
    const lanInterfaces = getLanIPv4Addresses();
    const lanIp = lanInterfaces.length > 0 ? lanInterfaces[0].ip : '127.0.0.1';
    const tunnelUrl = await getAutoDetectedTunnelUrl();

    // Section A.5: Terminal Startup Banner
    console.log(`
========================================================================
🚀 AuraSync Energy Twin Server Running
📍 Institution: Dayananda Sagar Academy of Technology and Management (DSATM)
👥 Developed by: O(1) Outlaws: AIML Engineers of DSATM

🔒 SINGLE-ORIGIN HTTPS ARCHITECTURE ACTIVE:
💻 Laptop:           https://localhost:${CLIENT_PORT}
📱 Phone (Same Wi-Fi): https://${lanIp}:${CLIENT_PORT}
🌐 Tunnel:           ${tunnelUrl ? tunnelUrl : 'None detected (start with npm run tunnel:cf)'}

⚡ Backend API Port:  http://localhost:${PORT} (proxied by Vite over HTTPS)
🔌 Socket.IO Path:    /socket.io
========================================================================
`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
