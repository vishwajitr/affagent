import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import { parseCSV } from '../utils/csvParser';
import { createError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { ContactFilters, ContactStatus } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All contact routes require auth
router.use(requireAuth);

// GET /api/contacts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '20', status, search } = req.query as ContactFilters;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { userId };

    if (status && Object.values(ContactStatus).includes(status as ContactStatus)) {
      where.status = status;
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: contacts,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts/upload
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    if (!req.file) return next(createError('CSV file is required', 400));
    if (!req.file.mimetype.includes('csv') && !req.file.originalname.endsWith('.csv')) {
      return next(createError('Only CSV files are accepted', 400));
    }

    const parsed = await parseCSV(req.file.buffer);
    if (parsed.length === 0) return next(createError('CSV file is empty or has no valid rows', 400));

    let inserted = 0;
    let skipped = 0;

    for (const contact of parsed) {
      try {
        await prisma.contact.upsert({
          where: { userId_phone: { userId, phone: contact.phone } },
          update: { name: contact.name },
          create: {
            userId,
            name: contact.name,
            phone: contact.phone,
            status: 'NOT_CALLED',
          },
        });
        inserted++;
      } catch {
        skipped++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Processed ${parsed.length} rows: ${inserted} upserted, ${skipped} skipped.`,
      data: { total: parsed.length, inserted, skipped },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/stats
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [total, interested, notInterested, noAnswer, failed, called] = await Promise.all([
      prisma.contact.count({ where: { userId } }),
      prisma.contact.count({ where: { userId, status: 'INTERESTED' } }),
      prisma.contact.count({ where: { userId, status: 'NOT_INTERESTED' } }),
      prisma.contact.count({ where: { userId, status: 'NO_ANSWER' } }),
      prisma.contact.count({ where: { userId, status: 'FAILED' } }),
      prisma.contact.count({ where: { userId, status: { not: 'NOT_CALLED' } } }),
    ]);

    const totalCalls = await prisma.call.count({
      where: { contact: { userId } },
    });
    const answeredCalls = await prisma.call.count({
      where: { contact: { userId }, callStatus: 'ANSWERED' },
    });
    const successRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalContacts: total,
        totalCalls,
        interested,
        notInterested,
        noAnswer,
        failed,
        called,
        successRate,
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!contact) return next(createError('Contact not found', 404));

    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
