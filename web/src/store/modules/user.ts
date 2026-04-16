import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, ResultEnum } from '@/constants';
import DataStorage from '@/utils/storage';
import { getUserInfo, login } from '@/api/system/user';
import { LoginParams, User } from '@/models/user';

export interface UserState {
  token: string;
  username: string;
  avatar: string;
  permissions: string[];
  userInfo: User;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    token: DataStorage.get(ACCESS_TOKEN, ''),
    username: '',
    avatar: '',
    permissions: [],
    userInfo: DataStorage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getUsername(): string {
      return this.username;
    },
    getPermissions(): string[] {
      return this.permissions;
    },
    getUserInfo(): User {
      return this.userInfo;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setUsername(username: string) {
      this.username = username;
    },
    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },
    setUserInfo(info: User) {
      this.userInfo = info;
    },
    // 登录
    async login(params: LoginParams) {
      const res = await login(params);

      if (res && res.code === ResultEnum.SUCCESS) {
        DataStorage.set(ACCESS_TOKEN, res.data);

        this.setToken(res.data);
      }
      return res;
    },

    // 获取用户信息
    async getInfo() {
      try {
        const res = await getUserInfo();

        if (res && res.code === 0) {
          const { user, permissions } = res.data;

          this.setPermissions(permissions);
          this.setUserInfo(user);
          this.setAvatar(user.avatar as string);
          this.setUsername(user.userName);
        }

        return res?.data;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return null;
      }
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo({
        userName: '',
        nickName: '',
        email: '',
        userId: '',
        phone: '',
        sex: '',
        password: '',
        status: 0,
        createdUser: '',
        updatedUser: '',
      });
      DataStorage.remove(ACCESS_TOKEN);
      DataStorage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
