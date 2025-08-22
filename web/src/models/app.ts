// 应用接口
export interface Application {
  appId: string;
  appName: string;
  appType: string;
  appTypeName: string;
  description: string;
  version: string;
  status: number;
  workflowId?: string; // 关联的工作流ID
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