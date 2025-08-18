import { Application, NodeType, WorkflowExecution } from '@/models/workflow';

// 模拟应用数据
export const mockApplications: Application[] = [
  {
    appId: 'app_001',
    appName: '智能客服助手',
    appType: 'chatbot',
    appTypeName: '聊天机器人',
    description: '基于大语言模型的智能客服系统，能够自动回答用户问题并提供个性化服务',
    version: '1.0.0',
    status: 1,
    workflowConfig: {
      nodes: [
        {
          id: 'node_input',
          type: 'input',
          name: '用户输入',
          position: { x: 100, y: 100 },
          data: {
            label: '用户输入',
            config: {
              inputType: 'text',
              required: true,
              placeholder: '请输入您的问题',
            },
            inputs: [],
            outputs: [
              { id: 'output_1', name: '用户问题', type: 'text', required: true },
            ],
          },
        },
        {
          id: 'node_llm',
          type: 'llm',
          name: 'LLM处理',
          position: { x: 400, y: 100 },
          data: {
            label: 'LLM处理',
            config: {
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 2000,
              systemPrompt: '你是一个专业的客服助手，请友好、准确地回答用户问题。',
              userPrompt: '用户问题：{{input}}',
            },
            inputs: [
              { id: 'input_1', name: '用户问题', type: 'text', required: true },
            ],
            outputs: [
              { id: 'output_1', name: 'AI回复', type: 'text', required: true },
            ],
          },
        },
        {
          id: 'node_output',
          type: 'output',
          name: '输出结果',
          position: { x: 700, y: 100 },
          data: {
            label: '输出结果',
            config: {
              outputType: 'text',
              format: '{{response}}',
            },
            inputs: [
              { id: 'input_1', name: 'AI回复', type: 'text', required: true },
            ],
            outputs: [],
          },
        },
      ],
      edges: [
        {
          id: 'edge_1',
          source: 'node_input',
          target: 'node_llm',
          sourceHandle: 'output_1',
          targetHandle: 'input_1',
        },
        {
          id: 'edge_2',
          source: 'node_llm',
          target: 'node_output',
          sourceHandle: 'output_1',
          targetHandle: 'input_1',
        },
      ],
      variables: [
        {
          id: 'var_1',
          name: 'maxRetries',
          type: 'number',
          value: 3,
          description: '最大重试次数',
        },
        {
          id: 'var_2',
          name: 'timeout',
          type: 'number',
          value: 30,
          description: '超时时间（秒）',
        },
      ],
    },
    createdUser: 'admin',
    updatedUser: 'admin',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
  },
  {
    appId: 'app_002',
    appName: '文档摘要生成器',
    appType: 'workflow',
    appTypeName: '工作流',
    description: '自动分析文档内容并生成结构化摘要，支持多种文档格式',
    version: '1.2.0',
    status: 0,
    workflowConfig: {
      nodes: [
        {
          id: 'node_file_input',
          type: 'input',
          name: '文档输入',
          position: { x: 50, y: 150 },
          data: {
            label: '文档输入',
            config: {
              inputType: 'file',
              required: true,
              placeholder: '请上传文档文件',
            },
            inputs: [],
            outputs: [
              { id: 'output_1', name: '文档内容', type: 'text', required: true },
            ],
          },
        },
        {
          id: 'node_transform',
          type: 'transform',
          name: '文本预处理',
          position: { x: 300, y: 150 },
          data: {
            label: '文本预处理',
            config: {
              transformType: 'text',
              script: '// 清理文本格式\nreturn input.replace(/\\s+/g, " ").trim();',
            },
            inputs: [
              { id: 'input_1', name: '原始文本', type: 'text', required: true },
            ],
            outputs: [
              { id: 'output_1', name: '清理后文本', type: 'text', required: true },
            ],
          },
        },
        {
          id: 'node_summary_llm',
          type: 'llm',
          name: '摘要生成',
          position: { x: 550, y: 150 },
          data: {
            label: '摘要生成',
            config: {
              model: 'gpt-3.5-turbo',
              temperature: 0.3,
              maxTokens: 1000,
              systemPrompt: '你是一个专业的文档分析师，请为以下文档生成结构化摘要。',
              userPrompt: '请为以下文档生成摘要：\n\n{{input}}\n\n要求：\n1. 提取关键信息\n2. 保持逻辑清晰\n3. 控制在500字以内',
            },
            inputs: [
              { id: 'input_1', name: '文档内容', type: 'text', required: true },
            ],
            outputs: [
              { id: 'output_1', name: '文档摘要', type: 'text', required: true },
            ],
          },
        },
      ],
      edges: [
        {
          id: 'edge_1',
          source: 'node_file_input',
          target: 'node_transform',
          sourceHandle: 'output_1',
          targetHandle: 'input_1',
        },
        {
          id: 'edge_2',
          source: 'node_transform',
          target: 'node_summary_llm',
          sourceHandle: 'output_1',
          targetHandle: 'input_1',
        },
      ],
      variables: [
        {
          id: 'var_1',
          name: 'summaryLength',
          type: 'number',
          value: 500,
          description: '摘要最大长度',
        },
        {
          id: 'var_2',
          name: 'language',
          type: 'string',
          value: 'zh-CN',
          description: '输出语言',
        },
      ],
    },
    createdUser: 'user1',
    updatedUser: 'user1',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    appId: 'app_003',
    appName: '数据分析助手',
    appType: 'agent',
    appTypeName: '智能代理',
    description: '智能数据分析工具，支持数据查询、统计分析和可视化报告生成',
    version: '2.1.0',
    status: 2,
    workflowConfig: {
      nodes: [],
      edges: [],
      variables: [],
    },
    createdUser: 'analyst',
    updatedUser: 'analyst',
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-22T11:30:00Z',
  },
];

// 模拟节点类型数据
export const mockNodeTypes: NodeType[] = [
  {
    type: 'input',
    name: '输入节点',
    category: 'input-output',
    icon: 'login',
    description: '接收外部输入数据',
    inputs: [],
    outputs: [
      { id: 'default_output', name: '输出', type: 'any', required: true },
    ],
    config: {
      inputType: 'text',
      required: true,
      defaultValue: '',
      placeholder: '请输入内容',
    },
  },
  {
    type: 'output',
    name: '输出节点',
    category: 'input-output',
    icon: 'logout',
    description: '输出处理结果',
    inputs: [
      { id: 'default_input', name: '输入', type: 'any', required: true },
    ],
    outputs: [],
    config: {
      outputType: 'text',
      format: '{{input}}',
    },
  },
  {
    type: 'llm',
    name: 'LLM节点',
    category: 'ai-model',
    icon: 'brain',
    description: '调用大语言模型进行文本处理',
    inputs: [
      { id: 'prompt_input', name: '提示词', type: 'text', required: true },
    ],
    outputs: [
      { id: 'response_output', name: '模型回复', type: 'text', required: true },
    ],
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: '',
      userPrompt: '{{input}}',
    },
  },
  {
    type: 'condition',
    name: '条件节点',
    category: 'logic-control',
    icon: 'fork',
    description: '根据条件进行分支处理',
    inputs: [
      { id: 'condition_input', name: '条件值', type: 'any', required: true },
    ],
    outputs: [
      { id: 'true_output', name: '真分支', type: 'any', required: false },
      { id: 'false_output', name: '假分支', type: 'any', required: false },
    ],
    config: {
      conditionType: 'equals',
      leftValue: '{{input}}',
      rightValue: '',
    },
  },
  {
    type: 'http',
    name: 'HTTP请求',
    category: 'data-processing',
    icon: 'internet',
    description: '发送HTTP请求获取数据',
    inputs: [
      { id: 'url_input', name: 'URL', type: 'text', required: true },
      { id: 'data_input', name: '请求数据', type: 'json', required: false },
    ],
    outputs: [
      { id: 'response_output', name: '响应数据', type: 'json', required: true },
    ],
    config: {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
      timeout: 30,
    },
  },
];

// 模拟执行历史数据
export const mockExecutions: WorkflowExecution[] = [
  {
    executionId: 'exec_001',
    appId: 'app_001',
    status: 'completed',
    startTime: '2024-01-22T10:30:00Z',
    endTime: '2024-01-22T10:30:15Z',
    result: {
      output: '感谢您的咨询！根据您的问题，我建议您可以通过以下方式解决...',
    },
    logs: [
      {
        nodeId: 'node_input',
        nodeName: '用户输入',
        timestamp: '2024-01-22T10:30:01Z',
        level: 'info',
        message: '接收到用户输入：如何重置密码？',
      },
      {
        nodeId: 'node_llm',
        nodeName: 'LLM处理',
        timestamp: '2024-01-22T10:30:05Z',
        level: 'info',
        message: '开始调用GPT-4模型处理用户问题',
      },
      {
        nodeId: 'node_llm',
        nodeName: 'LLM处理',
        timestamp: '2024-01-22T10:30:12Z',
        level: 'info',
        message: '模型处理完成，生成回复内容',
      },
      {
        nodeId: 'node_output',
        nodeName: '输出结果',
        timestamp: '2024-01-22T10:30:15Z',
        level: 'info',
        message: '输出处理结果完成',
      },
    ],
  },
  {
    executionId: 'exec_002',
    appId: 'app_001',
    status: 'failed',
    startTime: '2024-01-22T09:15:00Z',
    endTime: '2024-01-22T09:15:30Z',
    error: 'API调用超时',
    logs: [
      {
        nodeId: 'node_input',
        nodeName: '用户输入',
        timestamp: '2024-01-22T09:15:01Z',
        level: 'info',
        message: '接收到用户输入',
      },
      {
        nodeId: 'node_llm',
        nodeName: 'LLM处理',
        timestamp: '2024-01-22T09:15:05Z',
        level: 'info',
        message: '开始调用GPT-4模型',
      },
      {
        nodeId: 'node_llm',
        nodeName: 'LLM处理',
        timestamp: '2024-01-22T09:15:30Z',
        level: 'error',
        message: 'API调用超时，请求失败',
      },
    ],
  },
  {
    executionId: 'exec_003',
    appId: 'app_002',
    status: 'running',
    startTime: '2024-01-22T11:00:00Z',
    logs: [
      {
        nodeId: 'node_file_input',
        nodeName: '文档输入',
        timestamp: '2024-01-22T11:00:01Z',
        level: 'info',
        message: '开始处理上传的文档文件',
      },
      {
        nodeId: 'node_transform',
        nodeName: '文本预处理',
        timestamp: '2024-01-22T11:00:05Z',
        level: 'info',
        message: '正在进行文本预处理...',
      },
    ],
  },
];