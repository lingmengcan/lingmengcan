import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';
import {
  Application,
  ApplicationList,
  ApplicationParams,
  NodeType, 
  WorkflowExecution 
} from '@/models/workflow';

// 获取应用列表
export const getApplicationList = (data: ApplicationParams) =>
  http.request<Result<ApplicationList>>('llm/application-list', Method.POST, data);

// 新增应用
export const addApplication = (data: Application) =>
  http.request<Result<Application>>('llm/application-add', Method.POST, data);

// 修改应用
export const editApplication = (data: Application) =>
  http.request<Result<Application>>('llm/application-edit', Method.POST, data);

// 删除应用
export const deleteApplication = (appId: string) =>
  http.request<Result<boolean>>('llm/application-delete', Method.POST, { appId });

// 获取应用详情
export const getApplicationDetail = (appId: string) =>
  http.request<Result<Application>>('llm/application-detail', Method.POST, { appId });

// 复制应用
export const copyApplication = (appId: string, newName: string) =>
  http.request<Result<Application>>('llm/application-copy', Method.POST, { appId, newName });

// 获取节点类型列表
export const getNodeTypes = () =>
  http.request<Result<NodeType[]>>('llm/workflow-node-types', Method.GET);

// 执行工作流
export const executeWorkflow = (appId: string, inputs?: any) =>
  http.request<Result<WorkflowExecution>>('llm/workflow-execute', Method.POST, { appId, inputs });

// 获取工作流执行历史
export const getWorkflowExecutions = (appId: string, page: number = 1, pageSize: number = 10) =>
  http.request<Result<{ list: WorkflowExecution[]; count: number }>>('llm/workflow-executions', Method.POST, { 
    appId, 
    page, 
    pageSize 
  });

// 停止工作流执行
export const stopWorkflowExecution = (executionId: string) =>
  http.request<Result<boolean>>('llm/workflow-execution-stop', Method.POST, { executionId });

// 发布应用
export const publishApplication = (appId: string) =>
  http.request<Result<boolean>>('llm/application-publish', Method.POST, { appId });

// 取消发布应用
export const unpublishApplication = (appId: string) =>
  http.request<Result<boolean>>('llm/application-unpublish', Method.POST, { appId });
