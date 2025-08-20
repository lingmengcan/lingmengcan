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

@ApiTags('application')
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * 获取应用列表
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async getApplicationList(@Body() dto: ApplicationListDto) {
    return successJson(await this.applicationService.findAll(dto));
  }

  /**
   * 获取应用详情
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('detail')
  async getApplicationDetail(@Body() body: { appId: string }) {
    return successJson(await this.applicationService.findOne(body.appId));
  }

  /**
   * 新增应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addApplication(@Body() dto: ApplicationDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.create(dto, userName));
  }

  /**
   * 编辑应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async editApplication(@Body() dto: ApplicationDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.update(dto, userName));
  }

  /**
   * 删除应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('delete')
  async deleteApplication(@Body() body: { appId: string }) {
    return successJson(await this.applicationService.remove(body.appId));
  }

  /**
   * 复制应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('copy')
  async copyApplication(@Body() body: ApplicationCopyDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.copy(body.appId, body.newName, userName));
  }

  /**
   * 发布应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('publish')
  async publishApplication(@Body() body: { appId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.publish(body.appId, userName));
  }

  /**
   * 取消发布应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('unpublish')
  async unpublishApplication(@Body() body: { appId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.applicationService.unpublish(body.appId, userName));
  }
}
