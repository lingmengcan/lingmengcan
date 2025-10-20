import { DiffusionModelListDto, LlmListDto } from './model.dto';
import { DiffusionModel } from '@/modules/draw/diffusion-model.entity';
import { Llm } from './llm.entity';
import { DiffusionModelService } from '@/modules/draw/diffusion-model.service';
import { LlmService } from './llm.service';
import { successJson } from '@/utils/result';
import { Controller, UseGuards, Request, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('model') // 添加 接口标签 装饰器
@Controller('model')
export class ModelController {
  constructor(
    private readonly llmService: LlmService,
    private readonly diffusionModelService: DiffusionModelService,
  ) {}

  /**
   * llm 管理列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('llm-list')
  async findAll(@Body() dto: LlmListDto) {
    return successJson(await this.llmService.findAll(dto));
  }

  /**
   * llm model列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('llm-list-by-type')
  async findListByType(@Body('modelType') modelType: string) {
    return successJson(await this.llmService.findListByType(modelType));
  }

  /**
   * 添加
   *
   * @param model
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('llm-add')
  async add(@Body() llm: Llm, @Request() req: any) {
    const userName = req.user.userName;
    llm.updatedUser = userName;
    llm.createdUser = userName;
    return successJson(await this.llmService.addModel(llm));
  }

  /**
   * 编辑
   *
   * @param model
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('llm-edit')
  async edit(@Body() llm: Llm, @Request() req: any) {
    const userName = req.user.userName;
    llm.updatedUser = userName;
    return successJson(await this.llmService.updateModel(llm));
  }

  /**
   * diffusion 管理列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('diffusion-list')
  async findAllDiffusion(@Body() dto: DiffusionModelListDto) {
    return successJson(await this.diffusionModelService.findAll(dto));
  }

  /**
   * llm model列表
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('diffusion-list-by-type')
  async findDiffusionListByType(@Body('modelType') modelType: string) {
    return successJson(await this.diffusionModelService.findListByType(modelType));
  }

  /**
   * 添加
   *
   * @param model
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('diffusion-add')
  async addDiffusion(@Body() model: DiffusionModel, @Request() req: any) {
    const userName = req.user.userName;

    model.updatedUser = userName;
    model.createdUser = userName;

    return successJson(await this.diffusionModelService.addModel(model));
  }

  /**
   * 编辑
   *
   * @param model
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('diffusion-edit')
  async editDiffusion(@Body() model: DiffusionModel, @Request() req: any) {
    const userName = req.user.userName;
    model.updatedUser = userName;
    return successJson(await this.diffusionModelService.updateModel(model));
  }
}
