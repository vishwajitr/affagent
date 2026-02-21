import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

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

export default router;
