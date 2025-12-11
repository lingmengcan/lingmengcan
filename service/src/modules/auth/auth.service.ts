import { Injectable } from '@nestjs/common';
import { JwtPayload, LoginDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import * as SvgCaptcha from 'svg-captcha';
import { Result, successJson } from '@/utils/result';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/modules/system/user/user.entity';
import { UserService } from '@/modules/system/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * 生成验证码
   */
  async generateCaptcha() {
    const captcha = SvgCaptcha.create({
      size: 5,
      fontSize: 40,
      width: 90,
      height: 40,
      noise: 1,
      background: '#FF9800',
    });
    return captcha;
  }

  /**
   * user login
   * @param loginDto
   * @param captcha
   */
  async login(loginDto: LoginDto, captcha: string) {
    const { username, password } = loginDto;

    let res = new Result<string>();
    if (loginDto.captcha?.toUpperCase() === captcha?.toUpperCase()) {
      const user = await this.userService.findByUsername(username);

      if (!user) {
        res.code = 10001;
        res.message = `登录用户：${username} 不存在.`;
      } else if (user.status !== 0) {
        res.code = 10002;
        res.message = `登录用户：${username} 已被停用.`;
      } else {
        // 校验密码
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
          const payload: JwtPayload = {
            id: user.userId,
            email: user.email,
            username: user.userName,
          };

          const token = await this.jwtService.signAsync(payload);

          res = successJson(token);
        } else {
          res.code = 10003;
          res.message = '用户名或者密码不正确';
        }
      }
    } else {
      res.code = 10005;
      res.message = '验证码不正确.';
    }

    return res;
  }

  /**
   * validate user name and password
   * @param payload
   */
  async validateUser(payload: JwtPayload): Promise<User> {
    // 每次验证都要查数据库，性能不行。后续要加一层redis
    const user = await this.userService.findByUserId(payload.id);

    return user;
  }
}
