import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';

// 调试会话接口
export interface DebugSession {
  sessionId: string;
  workflowId: string;
  status: 'running' | 'paused' | 'stopped' | 'completed';
  currentNodeId: string | null;
  stepCount: number;
  startTime: number;
  duration: number;
  variables: Record<string, any>;
  breakpoints: string[];
}

// 调试步骤接口
export interface DebugStep {
  stepId: string;
  nodeId: string;
  nodeName: string;
  action: string;
  variables: Record<string, any>;
  timestamp: number;
  duration: number;
}

// 断点接口
export interface Breakpoint {
  nodeId: string;
  nodeName: string;
  condition?: string;
  enabled: boolean;
}

// 开始调试会话
export const startDebugSession = (workflowId: string, breakpoints: string[] = []) =>
  http.request<Result<DebugSession>>('debug/start', Method.POST, { workflowId, breakpoints });

// 暂停调试会话
export const pauseDebugSession = (sessionId: string) =>
  http.request<Result<boolean>>('debug/pause', Method.POST, { sessionId });

// 继续调试会话
export const continueDebugSession = (sessionId: string) =>
  http.request<Result<boolean>>('debug/continue', Method.POST, { sessionId });

// 单步执行
export const stepDebugSession = (sessionId: string) =>
  http.request<Result<DebugStep>>('debug/step', Method.POST, { sessionId });

// 停止调试会话
export const stopDebugSession = (sessionId: string) =>
  http.request<Result<boolean>>('debug/stop', Method.POST, { sessionId });

// 获取调试会话状态
export const getDebugSessionStatus = (sessionId: string) =>
  http.request<Result<DebugSession>>('debug/status', Method.POST, { sessionId });

// 设置断点
export const setBreakpoint = (sessionId: string, nodeId: string, condition?: string) =>
  http.request<Result<Breakpoint>>('debug/breakpoint/set', Method.POST, { sessionId, nodeId, condition });

// 移除断点
export const removeBreakpoint = (sessionId: string, nodeId: string) =>
  http.request<Result<boolean>>('debug/breakpoint/remove', Method.POST, { sessionId, nodeId });

// 获取断点列表
export const getBreakpoints = (sessionId: string) =>
  http.request<Result<Breakpoint[]>>('debug/breakpoints', Method.POST, { sessionId });

// 获取变量值
export const getVariables = (sessionId: string, nodeId?: string) =>
  http.request<Result<Record<string, any>>>('debug/variables', Method.POST, { sessionId, nodeId });

// 设置变量值
export const setVariable = (sessionId: string, name: string, value: any) =>
  http.request<Result<boolean>>('debug/variable/set', Method.POST, { sessionId, name, value });

// 获取执行日志
export const getExecutionLogs = (sessionId: string, level?: string) =>
  http.request<Result<Array<{ timestamp: number; level: string; message: string; nodeId?: string }>>>(
    'debug/logs',
    Method.POST,
    { sessionId, level },
  );

// 导出调试数据
export const exportDebugData = (sessionId: string) =>
  http.request<Result<{ session: DebugSession; logs: any[]; variables: Record<string, any> }>>(
    'debug/export',
    Method.POST,
    { sessionId },
  );
