require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const redisClient = require('./config/redis');
const { generalLimiter, createAliasLimiter } = require('./middleware/rateLimiter');

const aliasRoutes = require('./routes/aliases');
const messageRoutes = require('./routes/messages');

const emailPollingService = require('./services/emailPollingService');
const mailhogService = require('./services/mailhogService');
const cleanupService = require('./services/cleanupService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(generalLimiter);

app.use('/api/aliases', createAliasLimiter);
app.use('/api/aliases', aliasRoutes);
app.use('/api/mail', messageRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/stats', async (req, res) => {
  try {
    const { EmailAlias, EmailMessage } = require('./models');

    const activeAliases = await EmailAlias.count({
      where: { isActive: true }
    });

    const totalMessages = await EmailMessage.count();

    res.json({
      activeAliases,
      totalMessages,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

async function startServer() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    if (process.env.USE_MAILHOG === 'true') {
      setInterval(async () => {
        await mailhogService.processMessages();
      }, 5000);
      console.log('MailHog polling service started');
    } else {
      emailPollingService.start();
      console.log('Email polling service started');
    }

    cleanupService.start();
    console.log('Cleanup service started');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  emailPollingService.stop();
  cleanupService.stop();
  redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  emailPollingService.stop();
  cleanupService.stop();
  redisClient.quit();
  process.exit(0);
});

startServer();