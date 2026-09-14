import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socketHandler';
import droneRoutes from './routes/droneRoutes';
import eventRoutes from './routes/eventRoutes';
import missingPersonRoutes from './routes/missingPersonRoutes';
import authRoutes from './routes/authRoutes';
import { DroneStatusStore } from './models/DroneStatus';
import { EventStore } from './models/Event';
import { MissingPersonStore } from './models/MissingPerson';
import { UserStore } from './models/User';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configure Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

initSocket(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drone', droneRoutes);
app.use('/api/missing-persons', missingPersonRoutes);
app.use('/api', eventRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'SK¥_P@TROL AI Search & Rescue Ground Command Center',
    timestamp: new Date().toISOString(),
  });
});

// Seed Baseline Initial Data
const seedInitialData = async () => {
  try {
    await DroneStatusStore.updateStatus({
      droneId: 'DRONE-01',
      latitude: 28.6139,
      longitude: 77.2090,
      lastUpdate: new Date(),
      isOnline: true,
      source: 'LIVE',
    });

    const eventCount = await EventStore.countEvents();
    if (eventCount === 0) {
      await EventStore.createEvent({
        droneId: 'DRONE-01',
        eventType: 'PERSON',
        latitude: 28.6145,
        longitude: 77.2095,
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
        source: 'LIVE',
        status: 'ACTIVE',
      });
      await EventStore.createEvent({
        droneId: 'DRONE-01',
        eventType: 'FIRE_SMOKE',
        latitude: 28.6152,
        longitude: 77.2105,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        source: 'LIVE',
        status: 'ACTIVE',
      });
      console.log('[SEED] Initialized baseline detection events');
    }

    const missingStats = await MissingPersonStore.countReports();
    if (missingStats.total === 0) {
      await MissingPersonStore.createReport({
        name: 'Aarav Sharma',
        age: 26,
        gender: 'MALE',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        latitude: 28.6146,
        longitude: 77.2096,
        addressName: 'Sector 4 North Forest Boundary',
        description: 'Wearing blue jacket & black trousers. Separated from trekking team during sudden storm.',
        contactPhone: '+91 98765 43210',
        reportedByRole: 'CITIZEN',
        status: 'MISSING',
      });

      await MissingPersonStore.createReport({
        name: 'Priya Patel',
        age: 22,
        gender: 'FEMALE',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        latitude: 28.6158,
        longitude: 77.2112,
        addressName: 'Riverbed West Bank Camp',
        description: 'Red raincoat, carrying silver backpack. Last seen near riverbank crossing.',
        contactPhone: '+91 98123 76543',
        reportedByRole: 'CITIZEN',
        status: 'MISSING',
      });

      await MissingPersonStore.createReport({
        name: 'Rajesh Verma',
        age: 45,
        gender: 'MALE',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        latitude: 28.6132,
        longitude: 77.2081,
        addressName: 'Old Watchtower Outpost',
        description: 'Grey sweater, leather hat. Local guide assisting emergency evacuations.',
        contactPhone: '+91 99887 76655',
        reportedByRole: 'RESCUE_TEAM',
        status: 'RESCUED',
      });

      console.log('[SEED] Initialized sample missing person registry reports');
    }

    // Always ensure Demo Accounts are correctly hashed and seeded/updated
    const adminPass = await bcrypt.hash('admin123', 10);
    const commanderPass = await bcrypt.hash('commander123', 10);
    const citizenPass = await bcrypt.hash('citizen123', 10);

    await UserStore.upsertUser({
      name: 'System Admin',
      email: 'admin@skypetrol.com',
      password: adminPass,
      role: 'ADMIN',
    });

    await UserStore.upsertUser({
      name: 'Commander Vikram',
      email: 'commander@skypetrol.com',
      password: commanderPass,
      role: 'RESCUE_TEAM',
    });

    await UserStore.upsertUser({
      name: 'Ananya Roy',
      email: 'citizen@skypetrol.com',
      password: citizenPass,
      role: 'CITIZEN',
    });

    console.log('[SEED] Guaranteed seeded system accounts: admin@skypetrol.com (admin123), commander@skypetrol.com (commander123), citizen@skypetrol.com (citizen123)');
  } catch (err) {
    console.error('[SEED] Error seeding baseline data:', err);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedInitialData();

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  SK¥_P@TROL GROUND COMMAND CENTER SERVER IS RUNNING   `);
    console.log(`  PORT: http://localhost:${PORT}                      `);
    console.log(`  WEBSOCKET: Enabled                                   `);
    console.log(`=======================================================`);
  });
};

startServer();
