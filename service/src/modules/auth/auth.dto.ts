import { IsNotEmpty, MinLength, Length, IsEmail } from 'class-validator';

export class LoginDto {
  // username or email
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @Length(5)
  captcha: string;
}

export class JwtPayload {
  id: string;
  username: string;
  email: string;
}

export class ForgetPasswordDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  @Length(5)
  captcha: string;
}
