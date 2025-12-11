import { KnowledgeListDto } from './knowledge.dto';
import { Knowledge } from './knowledge.entity';
import { KnowledgeService } from './knowledge.service';
import { successJson } from '@/utils/result';
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('knowledge') // 添加 接口标签 装饰器
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  /**
   * knowledge 管理列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('knowledge-list')
  async findAll(@Body() dto: KnowledgeListDto) {
    return successJson(await this.knowledgeService.findAll(dto));
  }

  /**
   * 添加
   *
   * @param model
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('knowledge-add')
  async add(@Body() knowledge: Knowledge, @Request() req: any) {
    const userName = req.user.userName;
    knowledge.updatedUser = userName;
    knowledge.createdUser = userName;
    return successJson(await this.knowledgeService.addKnowledge(knowledge));
  }

  /**
   * 编辑
   *
   * @param model
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('knowledge-edit')
  async edit(@Body() knowledge: Knowledge, @Request() req: any) {
    const userName = req.user.userName;
    knowledge.updatedUser = userName;
    return successJson(await this.knowledgeService.updateKnowledge(knowledge));
  }
}