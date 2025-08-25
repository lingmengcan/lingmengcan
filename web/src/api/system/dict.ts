import { Dict, DictList, DictParams } from '@/models/dict';
import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';

// 获取列表
export const getDictList = (data: DictParams) => http.request<Result<DictList>>('dict/list', Method.POST, data);

// 获取列表
export const getDictListByType = (dictType: string | string[] | number | number[]) =>
  http.request<Result<Dict[]>>('dict/list-by-type', Method.POST, { dictType });

// 新增
export const addDict = (data: Dict) => http.request<Result<Dict>>('dict/add', Method.POST, data);

// 修改
export const editDict = (data: Dict) => http.request<Result<Dict>>('dict/edit', Method.POST, data);

// 改变状态
export const changeDictStatus = (data: Dict) => http.request<Result<Dict>>('dict/change-status', Method.POST, data);
