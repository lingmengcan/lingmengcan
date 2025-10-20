/**
 * 工作流相关类型定义
 */

export interface WorkflowNode {
  id: string;
  type: string;
  data?: {
    label?: string;
    config?: Record<string, any>;
    [key: string]: any;
  };
  position?: {
    x: number;
    y: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, any>;
}

export interface WorkflowConfig {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
}

export interface NodeExecutionResult {
  type: string;
  data: any;
  timestamp?: string;
}

export interface LLMRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface LLMResponse {
  output: string;
  reasoning_content: string;
}

export interface ExecutionLogEntry {
  nodeId: string;
  nodeType: string;
  timestamp: string;
  message: string;
  result?: any;
  error?: string;
  [key: string]: any;
}

export interface WorkflowExecutionResult {
  result: any;
  executionLog: ExecutionLogEntry[];
  variables: Record<string, any>;
}

export interface ConditionConfig {
  variable: string;
  operator: string;
  value: any;
  logicalOperator?: string;
}

export interface LLMNodeConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
  userPrompt?: string;
  outputVariable?: string;
  outputType?: string;
  variableName?: string;
  inputType?: string;
}

export interface HttpNodeConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryCount?: number;
}

export interface LoopNodeConfig {
  maxIterations?: number;
  condition?: string;
  loopType?: string;
  variableName?: string;
}

export interface ParallelNodeConfig {
  parallelCount?: number;
  parallelType?: string;
}

export interface TransformNodeConfig {
  transformation?: string;
  transformationType?: string;
}

export interface DatabaseNodeConfig {
  operation: string;
  table?: string;
  query?: string;
  connectionString?: string;
  timeout?: number;
}