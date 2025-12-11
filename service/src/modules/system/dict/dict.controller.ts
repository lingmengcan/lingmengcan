import { DictListDto } from './dict.dto';
import { Dict } from './dict.entity';
import { DictService } from './dict.service';
import { successJson } from '@/utils/result';
import { Controller, UseGuards, Request, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiTags('dict') // 添加 接口标签 装饰器
@Controller('dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  /**
   * 管理列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async findAll(@Body() dto: DictListDto) {
    return successJson(await this.dictService.findAll(dto));
  }

  /**
   * 字典类型的子列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list-by-type')
  async findListByType(@Body('dictType') dictType: string | string[]) {
    return successJson(await this.dictService.findListByType(dictType));
  }

  /**
   * 变更状态
   *
   * @param dict
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-status')
  async changeStatus(@Body() dict: Dict, @Request() req: any) {
    const userName = req.user.userName;
    dict.updatedUser = userName;
    return successJson(await this.dictService.updateStatus(dict));
  }

  /**
   * 添加
   *
   * @param dict
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  async add(@Body() dict: Dict, @Request() req: any) {
    const userName = req.user.userName;
    dict.updatedUser = userName;
    dict.createdUser = userName;
    return successJson(await this.dictService.addDict(dict));
  }

  /**
   * 编辑
   *
   * @param dict
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async edit(@Body() dict: Dict, @Request() req: any) {
    const userName = req.user.userName;
    dict.updatedUser = userName;
    return successJson(await this.dictService.updateDict(dict));
  }
}
