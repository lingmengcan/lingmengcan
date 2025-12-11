import { Plugin } from '@/models/plugin';
import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';

/**
 * 获取插件列表
 * @param params 查询参数
 * @returns 插件列表
 */
export interface PluginListResult {
  list: Plugin[];
  total: number;
}

export interface PluginQueryParams {
  pluginName?: string;
  pluginType?: string;
  page?: number;
  pageSize?: number;
}

// 获取插件列表
export const getPluginList = (params: PluginQueryParams) =>
  http.request<Result<PluginListResult>>('plugin/list', Method.POST, params);

// 获取插件详情
export const getPluginDetail = (pluginId: string) => http.request<Result<Plugin>>(`plugin/${pluginId}`, Method.GET);

// 新增插件
export const addPlugin = (data: Plugin) => http.request<Result<Plugin>>('plugin/add', Method.POST, data);

// 修改插件
export const editPlugin = (data: Plugin) => http.request<Result<Plugin>>('plugin/edit', Method.POST, data);

// 删除插件
export const deletePlugin = (pluginId: string) =>
  http.request<Result<boolean>>(`plugin/delete/${pluginId}`, Method.POST);

// 启用/禁用插件
export const changePluginStatus = (pluginId: string, status: number) =>
  http.request<Result<boolean>>(`plugin/change-status`, Method.POST, { pluginId, status });

// 获取插件分类列表
export const getPluginCategories = () => http.request<Result<string[]>>('plugin/categories', Method.GET);
