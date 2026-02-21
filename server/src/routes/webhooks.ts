import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { generateVoiceResponse, generateInputResponse } from '../services/twilioService';

const router = Router();

// POST /voice — Twilio calls this when a call connects
router.post('/voice', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, contactId } = req.query as { campaignId: string; contactId: string };

    if (!campaignId || !contactId) {
      const twiml = generateInputResponse('');
      res.type('text/xml').send(twiml);
      return;
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });

    if (!campaign) {
      res.type('text/xml').send('<Response><Say>Campaign not found.</Say><Hangup/></Response>');
      return;
    }

    // Update call record status to RINGING/ANSWERED
    await prisma.call.updateMany({
      where: { contactId, campaignId, callStatus: 'INITIATED' },
      data: { callStatus: 'ANSWERED' },
    });

    const twiml = generateVoiceResponse(campaign.script, campaignId, contactId);
    res.type('text/xml').send(twiml);
  } catch (err) {
    next(err);
  }
});

// POST /handle-input — Twilio sends the keypad digit here
router.post('/handle-input', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, contactId } = req.query as { campaignId: string; contactId: string };
    const { Digits: digit, CallSid: callSid } = req.body as { Digits: string; CallSid: string };

    if (digit && contactId && campaignId) {
      let newStatus: string;
      let lastResponse: string;

      if (digit === '1') {
        newStatus = 'INTERESTED';
        lastResponse = 'Pressed 1 - Interested';
      } else if (digit === '2') {
        newStatus = 'NOT_INTERESTED';
        lastResponse = 'Pressed 2 - Not Interested';
      } else {
        newStatus = 'CALLED';
        lastResponse = `Pressed ${digit} - Invalid input`;
      }

      // Update contact status
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: newStatus as any, lastResponse },
      });

      // Update call record with input
      if (callSid) {
        await prisma.call.updateMany({
          where: { callSid },
          data: { userInput: digit, callStatus: 'ANSWERED' },
        });
      } else {
        await prisma.call.updateMany({
          where: { contactId, campaignId, callStatus: 'ANSWERED' },
          data: { userInput: digit },
        });
      }
    }

    const twiml = generateInputResponse(digit || '');
    res.type('text/xml').send(twiml);
  } catch (err) {
    next(err);
  }
});

// POST /call-status — Twilio status callback
router.post('/call-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactId } = req.query as { contactId: string };
    const { CallSid: callSid, CallStatus: callStatus, CallDuration: duration } = req.body as {
      CallSid: string;
      CallStatus: string;
      CallDuration: string;
    };

    const statusMap: Record<string, string> = {
      'no-answer': 'NO_ANSWER',
      busy: 'NO_ANSWER',
      failed: 'FAILED',
      completed: 'ANSWERED',
    };

    const mappedCallStatus = statusMap[callStatus];

    if (callSid) {
      await prisma.call.updateMany({
        where: { callSid },
        data: {
          callStatus: (mappedCallStatus as any) || 'FAILED',
          duration: duration ? parseInt(duration, 10) : undefined,
        },
      });
    }

    // If no answer, update contact
    if (contactId && (callStatus === 'no-answer' || callStatus === 'busy')) {
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'NO_ANSWER', lastResponse: `Call ${callStatus}` },
      });
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
