import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import campaignRoutes from './routes/campaigns';
import contactRoutes from './routes/contacts';
import webhookRoutes from './routes/webhooks';
import { errorHandler, notFound } from './middleware/errorHandler';
import { validateTwilioConfig } from './services/twilioService';
import { prisma } from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Twilio sends form-encoded data for webhooks
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Config Status (Twilio readiness) ─────────────────────────
app.get('/api/config/status', (_req, res) => {
  const twilioError = validateTwilioConfig();
  res.json({
    twilioConfigured: twilioError === null,
    twilioError: twilioError,
    baseUrl: process.env.BASE_URL || null,
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contacts', contactRoutes);

// ─── Twilio Webhook Routes (no /api prefix — Twilio calls these directly) ──
app.use('/', webhookRoutes);

// ─── 404 & Error Handler ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
