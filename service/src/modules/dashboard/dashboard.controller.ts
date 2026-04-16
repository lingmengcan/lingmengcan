import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { successJson } from '@/utils/result';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('overview')
  async getOverview() {
    const data = await this.dashboardService.getOverview();
    return successJson(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user-growth')
  async getUserGrowth(@Query('days') days: number = 7) {
    const data = await this.dashboardService.getUserGrowth(days);
    return successJson(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('conversation-trend')
  async getConversationTrend(@Query('days') days: number = 7) {
    const data = await this.dashboardService.getConversationTrend(days);
    return successJson(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('workflow-stats')
  async getWorkflowStats() {
    const data = await this.dashboardService.getWorkflowStats();
    return successJson(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('model-distribution')
  async getModelDistribution() {
    const data = await this.dashboardService.getModelDistribution();
    return successJson(data);
  }
}
