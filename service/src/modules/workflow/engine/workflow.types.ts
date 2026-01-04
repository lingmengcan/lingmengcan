/**
 * 工作流相关类型定义
 */

export interface WorkflowNode {
  id: string;
  type: string;
  data?: {
    label?: string;
    config?: Record<string, any>;
    inputs?: NodeInput[];
    outputs?: NodeOutput[];
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
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  data?: Record<string, any>;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  value: any;
  description?: string;
}

export interface WorkflowConfig {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
}

export interface NodeInput {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface NodeOutput {
  name: string;
  type: string;
  description?: string;
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

export interface ConditionNodeConfig {
  description?: string;
  conditions: ConditionConfig[];
  template?: string;
  outputMapping?: {
    trueOutput?: string;
    falseOutput?: string;
  };
  advancedOptions?: {
    caseSensitive?: boolean;
    trimWhitespace?: boolean;
    enableLogging?: boolean;
  };
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