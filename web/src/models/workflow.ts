/**
 * 工作流状态枚举
 */
export enum WorkflowStatus {
  DRAFT = 0, // 草稿
  PUBLISHED = 1, // 已发布
  ARCHIVED = 2, // 已归档
}

/**
 * 执行状态枚举
 */
export enum ExecutionStatus {
  RUNNING = 0, // 运行中
  SUCCESS = 1, // 成功
  FAILED = 2, // 失败
  STOPPED = 3, // 已停止
  TIMEOUT = 4, // 超时
}

// 工作流接口
export interface Workflow {
  workflowId: string;
  workflowName: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  config: WorkflowConfig;
  createdUser?: string;
  updatedUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 工作流配置
export interface WorkflowConfig {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
}

// 工作流查询参数
export interface WorkflowListParams {
  workflowName?: string;
  status?: WorkflowStatus;
  page: number;
  pageSize: number;
}

// 工作流列表响应
export interface WorkflowList {
  list: Workflow[];
  count: number;
  page: number;
  pageSize: number;
}

// 工作流执行记录
export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  status: ExecutionStatus;
  errorMessage?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  createdUser: string;
  createdAt: string;
}

// 工作流节点
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    inputs?: NodeInput[];
    outputs?: NodeOutput[];
  };
  selected?: boolean;
  style?: Record<string, any>;
}

// 工作流边
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

// 工作流变量
export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  value: any;
  description?: string;
}

// 节点类型
export interface WorkflowNodeType {
  nodeType: string;
  nodeName: string;
  description: string;
  icon: string;
  category: string;
  configSchema?: Record<string, any>;
}

// 节点输入
export interface NodeInput {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  default?: any;
}

// 节点输出
export interface NodeOutput {
  name: string;
  type: string;
  description?: string;
}

// 输入参数类型（用于调试面板）
export interface InputParam {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

// 执行状态文本映射
export const ExecutionStatusText: Record<ExecutionStatus, string> = {
  [ExecutionStatus.RUNNING]: '运行中',
  [ExecutionStatus.SUCCESS]: '成功',
  [ExecutionStatus.FAILED]: '失败',
  [ExecutionStatus.STOPPED]: '已停止',
  [ExecutionStatus.TIMEOUT]: '超时',
};

// 工作流状态文本映射
export const WorkflowStatusText: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: '草稿',
  [WorkflowStatus.PUBLISHED]: '已发布',
  [WorkflowStatus.ARCHIVED]: '已归档',
};

