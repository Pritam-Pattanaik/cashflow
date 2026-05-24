import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSiteExpenses(startDate?: string, endDate?: string) {
    const where: any = { status: 'APPROVED' };
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const sites = await this.prisma.site.findMany();
    const expenses = await this.prisma.expense.groupBy({
      by: ['siteId'],
      where,
      _sum: { amount: true },
    });

    return sites.map((site) => {
      const expenseSum = expenses.find((e) => e.siteId === site.id);
      return {
        siteId: site.id,
        siteCode: site.code,
        siteName: site.name,
        totalExpenses: expenseSum?._sum.amount || new Decimal(0),
      };
    });
  }

  async getCategoryExpenses(siteId?: string, startDate?: string, endDate?: string) {
    const where: any = { status: 'APPROVED' };
    if (siteId) where.siteId = siteId;
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const categories = await this.prisma.expenseCategory.findMany();
    const expenses = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
    });

    return categories.map((cat) => {
      const expenseSum = expenses.find((e) => e.categoryId === cat.id);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalExpenses: expenseSum?._sum.amount || new Decimal(0),
      };
    });
  }

  async getCashFlow(siteId?: string, startDate?: string, endDate?: string) {
    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const ledgerEntries = await this.prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { site: { select: { name: true, code: true } } },
    });

    return ledgerEntries.map((entry) => ({
      id: entry.id,
      siteName: entry.site.name,
      siteCode: entry.site.code,
      transactionType: entry.transactionType,
      referenceType: entry.referenceType,
      credit: entry.credit,
      debit: entry.debit,
      balanceAfter: entry.balanceAfter,
      description: entry.description,
      createdAt: entry.createdAt,
    }));
  }

  async getMonthlySpending(siteId?: string) {
    const where: any = { status: 'APPROVED' };
    if (siteId) where.siteId = siteId;

    const expenses = await this.prisma.expense.findMany({
      where,
      select: {
        amount: true,
        expenseDate: true,
      },
      orderBy: { expenseDate: 'asc' },
    });

    const monthlyMap: Record<string, Decimal> = {};
    expenses.forEach((exp) => {
      const date = new Date(exp.expenseDate);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyMap[key]) {
        monthlyMap[key] = new Decimal(0);
      }
      monthlyMap[key] = monthlyMap[key].plus(exp.amount);
    });

    return Object.keys(monthlyMap).map((key) => ({
      month: key,
      amount: monthlyMap[key],
    }));
  }
}
