// 工作流接口
export interface Workflow {
  workflowId: string;
  workflowName: string;
  description: string;
  version: string;
  status: number;
  config: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    variables: WorkflowVariable[];
  };
  createdUser?: string;
  updatedUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 工作流查询参数
export interface WorkflowListParams {
  workflowName?: string;
  status?: number;
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
  inputs?: any;
  outputs?: any;
  status: number;
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
    config: any;
    inputs?: NodeInput[];
    outputs?: NodeOutput[];
  };
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
  configSchema?: any;
}

// 节点输入
export interface NodeInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// 节点输出
export interface NodeOutput {
  name: string;
  type: string;
  description: string;
}

// 应用接口 (保留原有的应用接口，以保持兼容性)
export interface Application {
  appId: string;
  appName: string;
  appType: string;
  appTypeName: string;
  description: string;
  version: string;
  status: number;
  workflowConfig: {
    nodes: any[];
    edges: any[];
    variables: any[];
  };
  createdUser?: string;
  updatedUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 应用查询参数
export interface ApplicationParams {
  appName?: string;
  appType?: string;
  status?: number;
  page: number;
  pageSize: number;
}

// 应用列表响应
export interface ApplicationList {
  list: Application[];
  count: number;
  page: number;
  pageSize: number;
}