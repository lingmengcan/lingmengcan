import { ACCESS_TOKEN, ResultEnum } from '@/constants';
import DataStorage from '@/utils/storage';
import { useUserStore } from '@/store/modules/user';
import AxiosPlus, { AxiosPlusConfig } from './axiosplus';

export function useHttp(withToken = true) {
  const httpConfig: AxiosPlusConfig = {
    baseURL: import.meta.env.VITE_GLOB_API_URL as string,
    headers: {
      Authorization: '',
    },
  };

  const axiosPlus = new AxiosPlus(httpConfig);

  // request拦截器
  axiosPlus.getAxios().interceptors.request.use(
    (config) => {
      const token = DataStorage.get(ACCESS_TOKEN, '');

      if (withToken && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // 响应拦截器
  axiosPlus.getAxios().interceptors.response.use(
    (response) => {
      const message = window['$message'];

      if (response?.data?.code !== ResultEnum.SUCCESS) {
        message.error(response?.data?.message || '系统错误');
      }
      return response;
    },
    (error) => {
      const message = window['$message'];
      const { response } = error;
      const msg: string = response?.data?.message || '';
      if (response) {
        switch (response.status) {
          case 400:
            message.error(msg);
            break;
          case 401:
            message.error('用户没有权限（令牌、用户名、密码错误）!');
            useUserStore().logout();
            break;
          case 403:
            message.error('用户得到授权，但是访问是被禁止的。!');
            break;
          // 404请求不存在
          case 404:
            message.error('网络请求错误，未找到该资源!');
            break;
          case 405:
            message.error('网络请求错误，请求方法未允许!');
            break;
          case 408:
            message.error('网络请求超时');
            break;
          case 500:
            message.error('服务器错误,请联系管理员!');
            break;
          case 501:
            message.error('网络未实现');
            break;
          case 502:
            message.error('网络错误');
            break;
          case 503:
            message.error('服务不可用，服务器暂时过载或维护!');
            break;
          case 504:
            message.error('网络超时');
            break;
          case 505:
            message.error('http版本不支持该请求!');
            break;
          default:
            message.error(msg);
            break;
        }
      }
      return Promise.reject(error);
    },
  );

  return axiosPlus;
}

export async function httpStream(url: string, data: any) {
  const token = DataStorage.get(ACCESS_TOKEN, '');
  const res = await fetch(import.meta.env.VITE_GLOB_API_URL + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  // const reader = res.body?.getReader();

  return res;
}

/**
 * Note: 接口结果标准类
 *
 * {
    "code": 0,
    "message": "success",
    "data": {
        "accessToken": "admin-token"
    }
}
 */
export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export const httpNoAuth = useHttp(false);

export default useHttp();
