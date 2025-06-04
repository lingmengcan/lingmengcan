import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';
import { Knowledge, KnowledgeList, KnowledgeParams } from '@/models/app';

// 获取列表
export const getKnowledgeList = (data: KnowledgeParams) =>
  http.request<Result<KnowledgeList>>('app/knowledge-list', Method.POST, data);

// 新增
export const addKnowledge = (data: Knowledge) =>
  http.request<Result<Knowledge>>('app/knowledge-add', Method.POST, data);

// 修改
export const editKnowledge = (data: Knowledge) =>
  http.request<Result<Knowledge>>('app/knowledge-edit', Method.POST, data);
