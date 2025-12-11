import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PluginService } from './plugin.service';
import { PluginDto, PluginQueryDto } from './plugin.dto';
import { successJson } from '@/utils/result';
import { Plugin } from './plugin.entity';

@ApiTags('插件管理')
@Controller('plugin')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @ApiOperation({ summary: '获取插件列表' })
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async findAll(@Body() query: PluginQueryDto) {
    return successJson(await this.pluginService.findAll(query));
  }

  @ApiOperation({ summary: '获取插件详情' })
  @UseGuards(AuthGuard('jwt'))
  @Post('detail')
  async findOne(@Body() body: { pluginId: string }) {
    return successJson(await this.pluginService.findOne(body.pluginId));
  }

  @ApiOperation({ summary: '创建插件' })
  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async create(@Body() pluginDto: PluginDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.pluginService.create(pluginDto, userName));
  }

  @ApiOperation({ summary: '更新插件' })
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async edit(@Body() pluginDto: PluginDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.pluginService.update(pluginDto, userName));
  }

  @ApiOperation({ summary: '删除插件' })
  @UseGuards(AuthGuard('jwt'))
  @Post('delete')
  async remove(@Body() body: { pluginId: string }) {
    return successJson(await this.pluginService.remove(body.pluginId));
  }

  @ApiOperation({ summary: '更新插件状态' })
  @UseGuards(AuthGuard('jwt'))
  @Post('change-status')
  async updateStatus(@Body() body: { pluginId: string; status: string }) {
    return successJson(await this.pluginService.updateStatus(body.pluginId, body.status));
  }

  @ApiOperation({ summary: '获取插件分类列表' })
  @UseGuards(AuthGuard('jwt'))
  @Post('categories')
  async getCategories() {
    return successJson(await this.pluginService.getCategories());
  }
}
