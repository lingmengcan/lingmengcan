import { Method } from '@/utils/http/axiosplus';
import http, { Result, httpStream } from '@/utils/http';
import { Workflow, WorkflowList, WorkflowListParams, WorkflowExecution } from '@/models/workflow';

// 获取工作流列表
export const getWorkflowList = (data: WorkflowListParams) =>
  http.request<Result<WorkflowList>>('workflow/list', Method.POST, data);

// 获取工作流详情
export const getWorkflowDetail = (workflowId: string) =>
  http.request<Result<Workflow>>('workflow/detail', Method.POST, { workflowId });

// 新增工作流
export const addWorkflow = (data: Omit<Workflow, 'workflowId'>) =>
  http.request<Result<Workflow>>('workflow/add', Method.POST, data);

// 编辑工作流
export const editWorkflow = (data: Workflow) => http.request<Result<Workflow>>('workflow/edit', Method.POST, data);

// 删除工作流
export const deleteWorkflow = (workflowId: string) =>
  http.request<Result<boolean>>('workflow/delete', Method.POST, { workflowId });

// 复制工作流
export const copyWorkflow = (workflowId: string, newName: string) =>
  http.request<Result<Workflow>>('workflow/copy', Method.POST, { workflowId, newName });

// 发布工作流
export const publishWorkflow = (workflowId: string) =>
  http.request<Result<boolean>>('workflow/publish', Method.POST, { workflowId });

// 取消发布工作流
export const unpublishWorkflow = (workflowId: string) =>
  http.request<Result<boolean>>('workflow/unpublish', Method.POST, { workflowId });

// 执行工作流
export const executeWorkflow = (workflowId: string, inputs?: any, stream: boolean = false) =>
  http.request<Result<WorkflowExecution>>('workflow/execute', Method.POST, { workflowId, inputs, stream });

// 执行工作流（流式）- 返回原始 fetch Response
export const executeWorkflowStream = (workflowId: string, inputs?: any) =>
  httpStream('workflow/execute', { workflowId, inputs, stream: true });

// 调试执行工作流
export const debugExecuteWorkflow = (workflowId: string, inputs?: any) =>
  http.request<Result<WorkflowExecution>>('workflow/debug-execute', Method.POST, { workflowId, inputs });

// 获取工作流执行历史
export const getWorkflowExecutions = (workflowId: string, page: number = 1, pageSize: number = 10) =>
  http.request<Result<{ list: WorkflowExecution[]; count: number }>>('workflow/executions', Method.POST, {
    workflowId,
    page,
    pageSize,
  });

// 停止工作流执行
export const stopWorkflowExecution = (executionId: string) =>
  http.request<Result<boolean>>('workflow/execution-stop', Method.POST, { executionId });
