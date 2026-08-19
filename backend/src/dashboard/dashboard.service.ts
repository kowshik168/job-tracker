import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const staleCutoff = new Date(now);
    staleCutoff.setDate(staleCutoff.getDate() - 15);

    const [
      totalApplications,
      applicationsThisWeek,
      oas,
      interviews,
      offers,
      rejections,
      needsAction,
      noResponse,
    ] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.count({
        where: { appliedAt: { gte: weekStart } },
      }),
      this.prisma.application.count({ where: { status: 'OA' } }),
      this.prisma.application.count({ where: { status: 'INTERVIEW' } }),
      this.prisma.application.count({ where: { status: 'OFFER' } }),
      this.prisma.application.count({ where: { status: 'REJECTED' } }),
      this.prisma.application.count({
        where: {
          lastActivityAt: { lte: staleCutoff },
          noResponseAt: null,
          status: { notIn: ['OFFER', 'REJECTED'] },
        },
      }),
      this.prisma.application.count({
        where: {
          noResponseAt: { not: null },
          status: { notIn: ['OFFER', 'REJECTED'] },
        },
      }),
    ]);

    const openCount = Math.max(totalApplications - offers - rejections, 0);
    const noResponseRate =
      openCount === 0 ? 0 : Math.round((noResponse / openCount) * 100);

    return {
      totalApplications,
      applicationsThisWeek,
      oas,
      interviews,
      offers,
      rejections,
      needsAction,
      noResponse,
      noResponseRate,
      staleAfterDays: 15,
    };
  }

  async getStatusBreakdown() {
    const results = await this.prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
      orderBy: { _count: { status: 'desc' } },
    });

    return results.map((r) => ({
      status: r.status,
      count: r._count.status,
    }));
  }

  async getResumeTypeBreakdown() {
    const results = await this.prisma.application.groupBy({
      by: ['resumeType'],
      _count: { resumeType: true },
      orderBy: { _count: { resumeType: 'desc' } },
    });

    return results.map((r) => ({
      resumeType: r.resumeType,
      count: r._count.resumeType,
    }));
  }

  async getApplicationTrend() {
    const applications = await this.prisma.application.findMany({
      select: { appliedAt: true },
      orderBy: { appliedAt: 'asc' },
    });

    const countsByMonth = new Map<string, number>();

    for (const app of applications) {
      const date = new Date(app.appliedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
    }

    return Array.from(countsByMonth.entries()).map(([month, count]) => ({
      month,
      count,
    }));
  }

  async getFollowUps() {
    const today = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const applications = await this.prisma.application.findMany({
      where: { followUpDate: { not: null } },
      orderBy: { followUpDate: 'asc' },
    });

    const dueToday = applications.filter((app) => {
      if (!app.followUpDate) return false;
      const d = startOfDay(app.followUpDate);
      return d.getTime() === today.getTime();
    });

    const overdue = applications.filter((app) => {
      if (!app.followUpDate) return false;
      return startOfDay(app.followUpDate) < today;
    });

    const upcoming = applications.filter((app) => {
      if (!app.followUpDate) return false;
      return startOfDay(app.followUpDate) > todayEnd;
    });

    return { dueToday, overdue, upcoming };
  }

  async getAttention() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 15);

    const resumeSelect = {
      id: true,
      name: true,
      resumeType: true,
      fileName: true,
      fileSize: true,
    } as const;

    const openStatuses: Array<'OFFER' | 'REJECTED'> = ['OFFER', 'REJECTED'];

    const [needsAction, noResponse] = await Promise.all([
      this.prisma.application.findMany({
        where: {
          lastActivityAt: { lte: cutoff },
          noResponseAt: null,
          status: { notIn: openStatuses },
        },
        orderBy: { lastActivityAt: 'asc' },
        include: { resume: { select: resumeSelect } },
      }),
      this.prisma.application.findMany({
        where: {
          noResponseAt: { not: null },
          status: { notIn: openStatuses },
        },
        orderBy: { noResponseAt: 'asc' },
        include: { resume: { select: resumeSelect } },
      }),
    ]);

    return { needsAction, noResponse, staleAfterDays: 15 };
  }
}
