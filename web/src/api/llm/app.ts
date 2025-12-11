import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';
import { Application, ApplicationList, ApplicationParams } from '@/models/app';

// 获取应用列表
export const getApplicationList = (data: ApplicationParams) =>
  http.request<Result<ApplicationList>>('application/list', Method.POST, data);

// 新增应用
export const addApplication = (data: Application) =>
  http.request<Result<Application>>('application/add', Method.POST, data);

// 修改应用
export const editApplication = (data: Application) =>
  http.request<Result<Application>>('application/edit', Method.POST, data);

// 删除应用
export const deleteApplication = (appId: string) =>
  http.request<Result<boolean>>('application/delete', Method.POST, { appId });

// 获取应用详情
export const getApplicationDetail = (appId: string) =>
  http.request<Result<Application>>('application/detail', Method.POST, { appId });

// 复制应用
export const copyApplication = (appId: string, newName: string) =>
  http.request<Result<Application>>('application/copy', Method.POST, { appId, newName });

// 发布应用
export const publishApplication = (appId: string) =>
  http.request<Result<boolean>>('application/publish', Method.POST, { appId });

// 取消发布应用
export const unpublishApplication = (appId: string) =>
  http.request<Result<boolean>>('application/unpublish', Method.POST, { appId });
