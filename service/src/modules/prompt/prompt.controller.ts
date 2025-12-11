import { Prompt } from './prompt.entity';
import { PromptService } from './prompt.service';
import { successJson } from '@/utils/result';
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('prompt') // 添加 swagger 接口标签
@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  /**
   * 列表
   *
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async chatList(@Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.promptService.findUserList(userName));
  }

  /**
   * 变更状态
   *
   * @param prompt
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-status')
  async changeStatus(@Body() prompt: Prompt) {
    return successJson(await this.promptService.updateStatus(prompt));
  }

  /**
   * 添加
   *
   * @param prompt
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  async add(@Body() prompt: Prompt, @Request() req: any) {
    const userName = req.user.userName;
    prompt.userName = userName;
    return successJson(await this.promptService.addPrompt(prompt));
  }

  /**
   * 编辑
   *
   * @param prompt
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async edit(@Body() prompt: Prompt) {
    return successJson(await this.promptService.updatePrompt(prompt));
  }
}
