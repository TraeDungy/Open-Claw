import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { NexusMarketplace } from '../../wallet-integrations/nexus-marketplace.mjs';
import { setupRoutes } from './routes/index.mjs';
import { setupWebSocket } from './websocket/index.mjs';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/nexus.log' })
  ]
});

const marketplace = new NexusMarketplace();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws://localhost:*', 'wss://localhost:*'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../../public')));

setupRoutes(app, marketplace, logger);
setupWebSocket(wss, marketplace, logger);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await marketplace.initialize();
    logger.info('Nexus Marketplace initialized');
    
    server.listen(PORT, () => {
      logger.info(`Nexus server running on port ${PORT}`);
      console.log(`🚀 Nexus by Open Claw - http://localhost:${PORT}`);
    });

    function shutdown(signal) {
      logger.info(`${signal} received, shutting down Nexus...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 5000);
    }
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
