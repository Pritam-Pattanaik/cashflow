import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any, userId: string, role: Role) {
    const { page = 1, limit = 10, siteId, transactionType, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // RBAC: Supervisors can only view ledger entries for their assigned sites
    if (role === Role.SUPERVISOR) {
      where.site = { supervisorId: userId };
    }

    if (siteId) {
      where.siteId = siteId;
    }
    if (transactionType) {
      where.transactionType = transactionType;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        skip,
        take: limit,
        include: {
          site: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySite(siteId: string, query: any, userId: string, role: Role) {
    // RBAC check
    if (role === Role.SUPERVISOR) {
      const site = await this.prisma.site.findUnique({ where: { id: siteId } });
      if (!site || site.supervisorId !== userId) {
        throw new ForbiddenException('You do not have access to this site ledger');
      }
    }

    return this.findAll({ ...query, siteId }, userId, role);
  }
}
