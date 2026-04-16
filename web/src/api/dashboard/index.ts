import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';

export interface OverviewData {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalModels: number;
  totalKnowledges: number;
  totalWorkflows: number;
  successRate: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface WorkflowStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  stopped: number;
  timeout: number;
}

export interface ModelDistribution {
  type: string;
  count: number;
}

export const getOverview = () => {
  return http.request<Result<OverviewData>>('dashboard/overview', Method.GET);
};

export const getUserGrowth = (days: number = 7) => {
  return http.request<Result<TrendData[]>>(`dashboard/user-growth?days=${days}`, Method.GET);
};

export const getConversationTrend = (days: number = 7) => {
  return http.request<Result<TrendData[]>>(`dashboard/conversation-trend?days=${days}`, Method.GET);
};

export const getWorkflowStats = () => {
  return http.request<Result<WorkflowStats>>('dashboard/workflow-stats', Method.GET);
};

export const getModelDistribution = () => {
  return http.request<Result<ModelDistribution[]>>('dashboard/model-distribution', Method.GET);
};
