import { MediaService } from './media/media.service';
import { successJson } from '@/utils/result';
import { Body, Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { MediaListDto, Txt2ImgDto } from '../draw/draw.dto';
import { ControlNetPreprocessorService } from './stable-diffusion/control-net-preprocessor.service';

@UseGuards(AuthGuard('jwt'))
@ApiTags('draw') // 添加 接口标签 装饰器
@Controller('draw')
export class DrawController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly controlNetPreprocessorService: ControlNetPreprocessorService,
  ) {}

  /**
   * 文生图
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('txt2img')
  async txt2img(@Body() dto: Txt2ImgDto, @Request() req: any) {
    const userName = req.user.userName;
    const res = await this.mediaService.txt2img(dto, userName);
    return successJson(res);
  }

  /**
   * 获取全部生成的内容
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async list(@Body() dto: MediaListDto, @Request() req: any) {
    const userName = req.user.userName;
    const res = await this.mediaService.findAll(dto, userName);

    return successJson(res);
  }

  /**
   * 获取全部control net 预处理器
   *
   * @param dto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('control-net-preprocessor-list')
  async getPreprocessorList() {
    const res = await this.controlNetPreprocessorService.findPreprocessorList();

    return successJson(res);
  }
}
