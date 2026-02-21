import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { startCampaignCalls } from '../services/campaignService';
import { validateTwilioConfig } from '../services/twilioService';
import { createError } from '../middleware/errorHandler';
import { CreateCampaignBody } from '../types';

const router = Router();

// GET /api/campaigns
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await prisma.campaign.findMany({
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
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
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
    const { name, script } = req.body as CreateCampaignBody;

    if (!name?.trim()) return next(createError('Campaign name is required', 400));
    if (!script?.trim()) return next(createError('Campaign script is required', 400));

    const campaign = await prisma.campaign.create({
      data: { name: name.trim(), script: script.trim() },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns/:id/start
router.post('/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate Twilio config BEFORE attempting any calls
    const configError = validateTwilioConfig();
    if (configError) {
      return next(createError(`Twilio not configured: ${configError}`, 400));
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
    });

    if (!campaign) return next(createError('Campaign not found', 404));

    const pendingCount = await prisma.contact.count({
      where: { status: 'NOT_CALLED' },
    });

    if (pendingCount === 0) {
      return next(createError('No contacts with "Not Called" status to dial.', 400));
    }

    // Fire and forget — calls run in background
    startCampaignCalls(campaign.id).catch((err) => {
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
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
