import { LoginParams, User, UserList, UserParams, UserResetPwd, UserRight } from '@/models/user';
import { Method } from '@/utils/http/axiosplus';
import http, { httpNoAuth, Result } from '@/utils/http';

/**
 * 获取验证码
 * @returns
 */
export const getCaptche = () => {
  return httpNoAuth.request<Result<UserRight>>('captcha', Method.GET);
};

/**
 * 登录获取token
 * @param data
 * @returns
 */
export const login = (data: LoginParams) => {
  return httpNoAuth.request<Result<string>>('login', Method.POST, data);
};

/**
 * 根据token获取登录用户信息
 * @returns
 */
export const getUserInfo = () => {
  return http.request<Result<UserRight>>('user/info', Method.GET);
};

// 获取列表
export const getUserList = (data: UserParams) => http.request<Result<UserList>>('user/list', Method.POST, data);

// 新增
export const addUser = (data: User) => http.request<Result<User>>('user/add', Method.POST, data);

// 修改
export const editUser = (data: User) => http.request<Result<User>>('user/edit', Method.POST, data);

// 改变状态
export const changeUserStatus = (data: User) => http.request<Result<User>>('user/change-status', Method.POST, data);

//重置密码
export const resetPassword = (data: UserResetPwd) => http.request<Result<string>>('user/reset-pwd', Method.PUT, data);

// 忘记密码 - 通过用户名和邮箱验证后重置密码
export const forgetPassword = (data: { username: string; email: string; newPassword: string; captcha: string }) =>
  httpNoAuth.request<Result<string>>('forget-password', Method.POST, data);
