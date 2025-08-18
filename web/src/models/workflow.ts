// 应用接口
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

// 工作流执行记录
export interface WorkflowExecution {
  executionId: string;
  appId: string;
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

// 工作流执行参数
export interface WorkflowExecuteParams {
  appId: string;
  inputs?: any;
}

// 节点类型
export interface NodeType {
  nodeType: string;
  nodeName: string;
  description: string;
  icon: string;
  category: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
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