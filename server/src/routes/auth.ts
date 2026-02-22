import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';

const router = Router();

function signToken(userId: string, username: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set in environment');
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username?.trim()) return next(createError('Username is required', 400));
    if (!password || password.length < 6) return next(createError('Password must be at least 6 characters', 400));

    const cleanUsername = username.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existing) return next(createError('Username already taken', 409));

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username: cleanUsername, password: hashed },
    });

    const token = signToken(user.id, user.username);

    res.status(201).json({
      success: true,
      data: { token, username: user.username, userId: user.id },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username?.trim()) return next(createError('Username is required', 400));
    if (!password) return next(createError('Password is required', 400));

    const cleanUsername = username.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (!user) return next(createError('Invalid username or password', 401));

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return next(createError('Invalid username or password', 401));

    const token = signToken(user.id, user.username);

    res.json({
      success: true,
      data: { token, username: user.username, userId: user.id },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password  (requires auth)
router.post('/change-password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword) return next(createError('Current password is required', 400));
    if (!newPassword || newPassword.length < 6) return next(createError('New password must be at least 6 characters', 400));

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(createError('User not found', 404));

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return next(createError('Current password is incorrect', 401));

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/twilio-settings  (requires auth)
router.get('/twilio-settings', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { twilioSid: true, twilioPhone: true, twilioToken: true },
    });

    if (!user) return next(createError('User not found', 404));

    const configured = !!(user.twilioSid && user.twilioToken && user.twilioPhone);

    res.json({
      success: true,
      data: {
        configured,
        twilioSid: user.twilioSid ?? null,
        twilioPhone: user.twilioPhone ?? null,
        // Never expose the full token — just whether it's set
        twilioTokenSet: !!user.twilioToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/twilio-settings  (requires auth)
router.put('/twilio-settings', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { twilioSid, twilioToken, twilioPhone } = req.body as {
      twilioSid?: string;
      twilioToken?: string;
      twilioPhone?: string;
    };

    if (!twilioSid?.trim()) return next(createError('Twilio Account SID is required', 400));
    if (!twilioSid.trim().startsWith('AC')) return next(createError('Account SID must start with "AC"', 400));
    if (twilioSid.trim().length !== 34) return next(createError('Account SID must be 34 characters', 400));
    if (!twilioToken?.trim()) return next(createError('Twilio Auth Token is required', 400));
    if (!twilioPhone?.trim()) return next(createError('Twilio Phone Number is required', 400));
    if (!twilioPhone.trim().startsWith('+')) return next(createError('Phone number must be in E.164 format (e.g. +919876543210)', 400));

    await prisma.user.update({
      where: { id: userId },
      data: {
        twilioSid: twilioSid.trim(),
        twilioToken: twilioToken.trim(),
        twilioPhone: twilioPhone.trim(),
      },
    });

    res.json({ success: true, message: 'Twilio settings saved successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/twilio-settings  (requires auth) — remove integration
router.delete('/twilio-settings', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { twilioSid: null, twilioToken: null, twilioPhone: null },
    });
    res.json({ success: true, message: 'Twilio integration removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
