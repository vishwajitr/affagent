import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { startCampaignCalls } from '../services/campaignService';
import { validateUserTwilioConfig } from '../services/twilioService';
import { createError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { CreateCampaignBody } from '../types';

const router = Router();

// All campaign routes require auth
router.use(requireAuth);

// GET /api/campaigns
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { calls: true } },
      },
    });

    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId },
      include: {
        calls: {
          include: { contact: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { calls: true } },
      },
    });

    if (!campaign) return next(createError('Campaign not found', 404));

    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name, script } = req.body as CreateCampaignBody;

    if (!name?.trim()) return next(createError('Campaign name is required', 400));
    if (!script?.trim()) return next(createError('Campaign script is required', 400));

    const campaign = await prisma.campaign.create({
      data: { userId, name: name.trim(), script: script.trim() },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns/:id/start
router.post('/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Fetch user's own Twilio credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twilioSid: true, twilioToken: true, twilioPhone: true },
    });

    const creds = {
      twilioSid: user?.twilioSid ?? '',
      twilioToken: user?.twilioToken ?? '',
      twilioPhone: user?.twilioPhone ?? '',
    };

    const configError = validateUserTwilioConfig(creds);
    if (configError) {
      return next(createError(`Twilio not configured: ${configError}`, 400));
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!campaign) return next(createError('Campaign not found', 404));

    const pendingCount = await prisma.contact.count({
      where: { userId, status: 'NOT_CALLED' },
    });

    if (pendingCount === 0) {
      return next(createError('No contacts with "Not Called" status to dial.', 400));
    }

    startCampaignCalls(campaign.id, userId, {
      twilioSid: creds.twilioSid,
      twilioToken: creds.twilioToken,
      twilioPhone: creds.twilioPhone,
    }).catch((err) => {
      console.error('Campaign start error:', err);
    });

    res.json({
      success: true,
      message: `Campaign "${campaign.name}" started. Calling ${pendingCount} contacts.`,
      data: { campaignId: campaign.id, contactsQueued: pendingCount },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!campaign) return next(createError('Campaign not found', 404));

    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
