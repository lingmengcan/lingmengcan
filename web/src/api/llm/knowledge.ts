import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';
import { Knowledge, KnowledgeList, KnowledgeParams } from '@/models/knowledge';

// 获取知识库列表
export const getKnowledgeList = (data: KnowledgeParams) =>
  http.request<Result<KnowledgeList>>('knowledge/knowledge-list', Method.POST, data);

// 新增知识库
export const addKnowledge = (data: Knowledge) =>
  http.request<Result<Knowledge>>('knowledge/knowledge-add', Method.POST, data);

// 修改知识库
export const editKnowledge = (data: Knowledge) =>
  http.request<Result<Knowledge>>('knowledge/knowledge-edit', Method.POST, data);
