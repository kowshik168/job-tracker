import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('status-breakdown')
  getStatusBreakdown() {
    return this.dashboardService.getStatusBreakdown();
  }

  @Get('resume-type-breakdown')
  getResumeTypeBreakdown() {
    return this.dashboardService.getResumeTypeBreakdown();
  }

  @Get('application-trend')
  getApplicationTrend() {
    return this.dashboardService.getApplicationTrend();
  }

  @Get('follow-ups')
  getFollowUps() {
    return this.dashboardService.getFollowUps();
  }

  @Get('attention')
  getAttention() {
    return this.dashboardService.getAttention();
  }
}
