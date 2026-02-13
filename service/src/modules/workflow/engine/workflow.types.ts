/**
 * 工作流相关类型定义
 */

// 统一的变量类型枚举
export type VariableType = 'text' | 'json' | 'number' | 'boolean' | 'array' | 'object';

// 节点输入变量定义
export interface NodeInputVariable {
  name: string;
  type: VariableType;
  source?: string; // 格式: "nodeId.variableName" - 数据来源
  required?: boolean;
  description?: string;
}

// 节点输出变量定义
export interface NodeOutputVariable {
  name: string;
  type: VariableType;
  description?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  data?: {
    label?: string;
    config?: {
      inputs?: NodeInputVariable[];
      outputs?: NodeOutputVariable[];
      [key: string]: any;
    };
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

// 兼容旧版本的类型别名
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
  outputs?: Record<string, any>; // 节点输出变量的实际值
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

// ==================== 节点配置类型 ====================

export interface ConditionConfig {
  variable: string;
  operator: string;
  value: any;
  logicalOperator?: string;
}

export interface ConditionNodeConfig {
  description?: string;
  inputs?: NodeInputVariable[];
  conditions: ConditionConfig[];
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
  variableName?: string; // 输入变量名
  outputVariable?: string; // 输出变量名
  outputType?: VariableType; // 输出类型
  inputs?: NodeInputVariable[];
  outputs?: NodeOutputVariable[];
}

export interface HttpNodeConfig {
  method: string;
  url: string;
  headers?: Array<{ key: string; value: string }> | Record<string, string>;
  body?: any;
  bodyType?: string;
  timeout?: number;
  retryCount?: number;
  errorHandling?: 'fail' | 'continue' | 'default';
  inputs?: NodeInputVariable[];
  outputs?: NodeOutputVariable[];
}

export interface LoopNodeConfig {
  loopType: 'foreach' | 'for' | 'while';
  iterateVariable?: string;
  startIndex?: number;
  endIndex?: number;
  step?: number;
  condition?: string;
  maxIterations?: number;
  breakCondition?: string;
  aggregation?: 'collect' | 'sum' | 'concat' | 'last' | 'first';
  inputs?: NodeInputVariable[];
  outputs?: NodeOutputVariable[];
}

export interface ParallelNodeConfig {
  strategy?: 'all' | 'any' | 'race';
  timeout?: number;
  errorHandling?: 'fail-fast' | 'continue' | 'ignore';
  mergeStrategy?: 'collect' | 'merge' | 'first' | 'last';
  inputs?: NodeInputVariable[];
  outputs?: NodeOutputVariable[];
}

export interface TransformNodeConfig {
  transformType: 'mapping' | 'filter' | 'format' | 'script' | 'extract' | 'merge';
  rules?: Array<{
    sourceField: string;
    targetField: string;
    transform: string;
    defaultValue?: string;
  }>;
  filterCondition?: string;
  inputFormat?: string;
  outputFormat?: string;
  customScript?: string;
  errorHandling?: 'skip' | 'fail' | 'default';
  inputs?: NodeInputVariable[];
  outputs?: NodeOutputVariable[];
}

export interface DatabaseNodeConfig {
  dataSource?: string;
  operationType: 'select' | 'insert' | 'update' | 'delete' | 'raw';
  tableName?: string;
  fields?: Array<{ name: string; alias?: string; value?: string }>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: string;
    logicalOperator?: string;
  }>;
  sql?: string;
  orderBy?: string;
  limit?: number;
  errorHandling?: 'fail' | 'continue' | 'rollback';
  inputs?: NodeInputVariable[];
  outputs?: NodeOutputVariable[];
}