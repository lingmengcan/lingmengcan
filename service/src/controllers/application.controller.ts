import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import {
  ApplicationListDto,
  ApplicationDto,
  ApplicationExecuteDto,
  ApplicationExecutionListDto,
  ApplicationCopyDto,
} from '@/dtos/application.dto';
import { successJson } from '@/utils/result';
import { ApplicationService } from '@/services/application.service';

@ApiTags('llm')
@Controller('llm')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * 获取应用列表
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-list')
  async getApplicationList(@Body() dto: ApplicationListDto) {
    return successJson(await this.applicationService.findAll(dto));
  }

  /**
   * 获取应用详情
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-detail')
  async getApplicationDetail(@Body() body: { appId: string }) {
    return successJson(await this.applicationService.findOne(body.appId));
  }

  /**
   * 新增应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-add')
  async addApplication(@Body() dto: ApplicationDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.create(dto, userName));
  }

  /**
   * 编辑应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-edit')
  async editApplication(@Body() dto: ApplicationDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.update(dto, userName));
  }

  /**
   * 删除应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-delete')
  async deleteApplication(@Body() body: { appId: string }) {
    return successJson(await this.applicationService.remove(body.appId));
  }

  /**
   * 复制应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-copy')
  async copyApplication(@Body() body: ApplicationCopyDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.copy(body.appId, body.newName, userName));
  }

  /**
   * 发布应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-publish')
  async publishApplication(@Body() body: { appId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.publish(body.appId, userName));
  }

  /**
   * 取消发布应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-unpublish')
  async unpublishApplication(@Body() body: { appId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.unpublish(body.appId, userName));
  }

  /**
   * 执行应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-execute')
  async executeApplication(@Body() dto: ApplicationExecuteDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.execute(dto, userName));
  }

  /**
   * 获取应用执行历史
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-executions')
  async getApplicationExecutions(@Body() dto: ApplicationExecutionListDto) {
    return successJson(await this.applicationService.getExecutions(dto));
  }

  /**
   * 停止应用执行
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('application-execution-stop')
  async stopApplicationExecution(@Body() body: { executionId: string }) {
    return successJson(await this.applicationService.stopExecution(body.executionId));
  }
}
