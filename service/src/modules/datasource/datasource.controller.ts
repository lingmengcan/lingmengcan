import { Controller, UseGuards, Request, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DatasourceService } from './datasource.service';
import { DatasourceListDto, TestConnectionDto } from './datasource.dto';
import { Datasource } from './datasource.entity';
import { successJson } from '@/utils/result';

@ApiTags('datasource')
@Controller('datasource')
export class DatasourceController {
  constructor(private readonly datasourceService: DatasourceService) {}

  /**
   * 数据源列表
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async findAll(@Body() dto: DatasourceListDto) {
    return successJson(await this.datasourceService.findAll(dto));
  }

  /**
   * 获取启用的数据源（供下拉选择）
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('active-list')
  async findActiveList() {
    return successJson(await this.datasourceService.findActiveList());
  }

  /**
   * 新增数据源
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async add(@Body() entity: Datasource, @Request() req: any) {
    const userName = req.user.userName;
    entity.createdUser = userName;
    entity.updatedUser = userName;
    return successJson(await this.datasourceService.add(entity));
  }

  /**
   * 编辑数据源
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async edit(@Body() entity: Datasource, @Request() req: any) {
    const userName = req.user.userName;
    entity.updatedUser = userName;
    return successJson(await this.datasourceService.update(entity));
  }

  /**
   * 修改状态（启用/禁用/删除）
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-status')
  async changeStatus(@Body() entity: Datasource, @Request() req: any) {
    const userName = req.user.userName;
    entity.updatedUser = userName;
    return successJson(await this.datasourceService.updateStatus(entity));
  }

  /**
   * 测试连接
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('test-connection')
  async testConnection(@Body() dto: TestConnectionDto) {
    try {
      await this.datasourceService.testConnection(dto);
      return successJson(true);
    } catch (error) {
      return successJson(false);
    }
  }
}
