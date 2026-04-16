import { Body, Controller, Get, Post, Req, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { successJson } from './utils/result';
import { ForgetPasswordDto, LoginDto } from './modules/auth/auth.dto';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  index(@Res() res) {
    res.status(302).redirect('/doc');
  }

  @Get('stream')
  async stream(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for (let i = 0; i < 10; i++) {
      res.write(`data: ${i}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    res.end();
  }

  /**
   * 获取验证码
   * @param req
   */
  @Get('captcha')
  async generateCaptcha(@Req() req: any) {
    const captcha = await this.authService.generateCaptcha();
    // 这里后续要改为分布式redis 过期时间3分钟
    req.session.captcha = captcha.text;

    return successJson(Buffer.from(captcha.data).toString('base64'));
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Session() session: any) {
    const captcha = session?.captcha;
    // 生成令牌
    return this.authService.login(loginDto, captcha);
  }

  /**
   * 忘记密码 - 通过用户名和邮箱验证后重置密码
   * @param forgetPasswordDto
   * @param session
   */
  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto, @Session() session: any) {
    const captcha = session?.captcha;
    return this.authService.forgetPassword(forgetPasswordDto, captcha);
  }
}
