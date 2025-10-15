import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Workflow } from '@/entities/workflow.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { Plugin } from '@/entities/plugin.entity';
import {
  WorkflowListDto,
  WorkflowDto,
  WorkflowExecuteDto,
  WorkflowExecutionListDto,
  WorkflowCopyDto,
  NodeTypeListDto,
} from '@/dtos/workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private readonly workflowExecutionRepository: Repository<WorkflowExecution>,
    @InjectRepository(Plugin)
    private readonly pluginRepository: Repository<Plugin>,
  ) {}

  /**
   * 获取工作流列表
   */
  async findAll(dto: WorkflowListDto) {
    const { workflowName, status, page, pageSize } = dto;

    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');

    if (workflowName) {
      queryBuilder.andWhere('workflow.workflowName LIKE :workflowName', { workflowName: `%${workflowName}%` });
    }

    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('workflow.status = :status', { status });
    }

    queryBuilder
      .orderBy('workflow.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, count] = await queryBuilder.getManyAndCount();

    return {
      list,
      count,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID获取工作流详情
   */
  async findOne(workflowId: string): Promise<Workflow> {
    return await this.workflowRepository.findOne({
      where: { workflowId },
    });
  }

  /**
   * 创建工作流
   */
  async create(dto: WorkflowDto, userName: string): Promise<Workflow> {
    const workflow = new Workflow();
    workflow.workflowId = uuidv4();
    workflow.workflowName = dto.workflowName;
    workflow.description = dto.description || '';
    workflow.version = dto.version || '1.0.0';
    workflow.status = dto.status || 0;
    workflow.config = dto.config || { nodes: [], edges: [], variables: [] };
    workflow.createdUser = userName;
    workflow.updatedUser = userName;

    return await this.workflowRepository.save(workflow);
  }

  /**
   * 更新工作流
   */
  async update(dto: WorkflowDto, userName: string): Promise<Workflow> {
    const workflow = await this.findOne(dto.workflowId);
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    workflow.workflowName = dto.workflowName;
    workflow.description = dto.description || workflow.description;
    workflow.version = dto.version || workflow.version;
    workflow.status = dto.status !== undefined ? dto.status : workflow.status;
    workflow.config = dto.config || workflow.config;
    workflow.updatedUser = userName;

    return await this.workflowRepository.save(workflow);
  }

  /**
   * 删除工作流
   */
  async remove(workflowId: string): Promise<boolean> {
    const result = await this.workflowRepository.delete({ workflowId });
    return result.affected > 0;
  }

  /**
   * 复制工作流
   */
  async copy(dto: WorkflowCopyDto, userName: string): Promise<Workflow> {
    const originalWorkflow = await this.findOne(dto.workflowId);
    if (!originalWorkflow) {
      throw new Error('原工作流不存在');
    }

    const newWorkflow = new Workflow();
    newWorkflow.workflowId = uuidv4();
    newWorkflow.workflowName = dto.newName;
    newWorkflow.description = originalWorkflow.description;
    newWorkflow.version = originalWorkflow.version;
    newWorkflow.status = 0; // 复制的工作流默认为草稿状态
    newWorkflow.config = originalWorkflow.config;
    newWorkflow.createdUser = userName;
    newWorkflow.updatedUser = userName;

    return await this.workflowRepository.save(newWorkflow);
  }

  /**
   * 发布工作流
   */
  async publish(workflowId: string, userName: string): Promise<boolean> {
    const workflow = await this.findOne(workflowId);
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    workflow.status = 1; // 已发布
    workflow.updatedUser = userName;

    await this.workflowRepository.save(workflow);
    return true;
  }

  /**
   * 取消发布工作流
   */
  async unpublish(workflowId: string, userName: string): Promise<boolean> {
    const workflow = await this.findOne(workflowId);
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    workflow.status = 0; // 草稿
    workflow.updatedUser = userName;

    await this.workflowRepository.save(workflow);
    return true;
  }

  /**
   * 执行工作流
   */
  async execute(dto: WorkflowExecuteDto, userName: string, isDebug: boolean = false): Promise<WorkflowExecution> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: dto.workflowId });
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    // 调试模式下允许执行未发布的工作流
    if (!isDebug && workflow.status !== 1) {
      throw new Error('工作流未发布，无法执行');
    }

    const execution = new WorkflowExecution();
    execution.executionId = uuidv4();
    execution.workflowId = dto.workflowId;
    execution.inputs = dto.inputs;
    execution.status = 0; // 运行中
    execution.startTime = new Date();
    execution.createdUser = userName;

    // 保存执行记录
    await this.workflowExecutionRepository.save(execution);

    // 异步执行工作流
    this.executeWorkflowAsync(workflow, execution, dto.inputs);

    return execution;
  }

  /**
   * 同步执行工作流（用于流式输出）
   */
  async executeSync(dto: WorkflowExecuteDto, userName: string): Promise<any> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: dto.workflowId });
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    // 流式模式下允许执行未发布的工作流（用于调试）
    // if (workflow.status !== 1) {
    //   throw new Error('工作流未发布，无法执行');
    // }

    const executionId = uuidv4();
    const startTime = Date.now();

    try {
      // 直接同步执行工作流引擎
      const result = await this.executeWorkflowEngine(workflow, dto.inputs);
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      // 返回接口文档格式
      const execution = {
        executionId,
        workflowId: dto.workflowId,
        parameters: dto.inputs,
        output: result.outputs?.result || result.result || '',
        executionLog: result.outputs?.executionLog || result.executionLog || [],
        duration,
        timestamp: new Date().toISOString(),
      };

      return execution;
    } catch (error) {
      console.error('工作流同步执行失败:', error);
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      // 返回错误状态的接口文档格式
      const execution = {
        executionId,
        workflowId: dto.workflowId,
        parameters: dto.inputs,
        output: '',
        executionLog: [
          {
            nodeId: 'error',
            nodeType: 'error',
            timestamp: new Date().toISOString(),
            message: `工作流执行失败: ${error.message}`,
            error: error.message,
          },
        ],
        duration,
        timestamp: new Date().toISOString(),
      };

      return execution;
    }
  }

  /**
   * 调试执行工作流
   */
  async debugExecute(dto: WorkflowExecuteDto, userName: string): Promise<WorkflowExecution> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: dto.workflowId });
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    // 调试模式下直接同步执行并返回详细日志
    try {
      const result = await this.executeWorkflowEngine(workflow, dto.inputs);

      // 创建调试执行记录
      const execution = new WorkflowExecution();
      execution.executionId = uuidv4();
      execution.workflowId = dto.workflowId;
      execution.inputs = dto.inputs;
      execution.status = 1; // 成功
      execution.startTime = new Date();
      execution.endTime = new Date();
      execution.duration = 0;
      execution.createdUser = userName;

      // 将调试信息存储在outputs中
      execution.outputs = {
        result: result.result,
        executionLog: result.executionLog || [],
        variables: result.variables || {},
        debugMode: true,
        timestamp: new Date().toISOString(),
      };

      return execution;
    } catch (error) {
      console.error('调试执行失败:', error);

      // 创建失败执行记录
      const execution = new WorkflowExecution();
      execution.executionId = uuidv4();
      execution.workflowId = dto.workflowId;
      execution.inputs = dto.inputs;
      execution.status = 2; // 失败
      execution.startTime = new Date();
      execution.endTime = new Date();
      execution.duration = 0;
      execution.errorMessage = error.message;
      execution.createdUser = userName;

      // 将错误信息存储在outputs中
      execution.outputs = {
        executionLog: [
          {
            nodeId: 'error',
            nodeType: 'error',
            timestamp: new Date().toISOString(),
            message: `调试执行失败: ${error.message}`,
            error: error.message,
          },
        ],
        debugMode: true,
        timestamp: new Date().toISOString(),
      };

      return execution;
    }
  }

  /**
   * 异步执行工作流
   */
  private async executeWorkflowAsync(workflow: Workflow, execution: WorkflowExecution, inputs: any) {
    try {
      const result = await this.executeWorkflowEngine(workflow, inputs);

      execution.status = 1; // 成功
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.outputs = result;

      await this.workflowExecutionRepository.save(execution);
    } catch (error) {
      console.error('工作流执行失败:', error);

      execution.status = 2; // 失败
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.errorMessage = error.message;

      await this.workflowExecutionRepository.save(execution);
    }
  }

  /**
   * 工作流执行引擎
   */
  private async executeWorkflowEngine(workflow: Workflow, inputs: any): Promise<any> {
    const { nodes, edges, variables } = workflow.config;

    if (!nodes || nodes.length === 0) {
      throw new Error('工作流配置无效：没有节点');
    }

    // 调试：记录工作流配置信息
    console.log('工作流配置调试信息:');
    console.log('节点数量:', nodes.length);
    console.log(
      '节点列表:',
      nodes.map((n) => ({ id: n.id, type: n.type, label: n.data?.label })),
    );
    console.log('边数量:', edges.length);
    console.log('边列表:', edges);
    console.log('变量:', variables);

    // 构建节点映射
    const nodeMap = new Map();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    // 构建边映射（邻接表）
    const edgeMap = new Map();
    edges.forEach((edge) => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source).push(edge.target);
    });

    // 找到开始节点
    const startNode = nodes.find((node) => node.type === 'start');
    if (!startNode) {
      throw new Error('工作流配置无效：没有开始节点');
    }

    console.log('开始节点:', { id: startNode.id, type: startNode.type, label: startNode.data?.label });

    // 执行上下文
    const context = {
      inputs,
      variables: { ...variables },
      nodeResults: new Map(),
      executionLog: [],
    };

    // 执行工作流
    const result = await this.executeNode(startNode, context, nodeMap, edgeMap);

    return {
      result,
      executionLog: context.executionLog,
      variables: context.variables,
    };
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: any,
    context: any,
    nodeMap: Map<string, any>,
    edgeMap: Map<string, string[]>,
  ): Promise<any> {
    const nodeId = node.id;
    const nodeType = node.type;

    // 记录执行日志
    context.executionLog.push({
      nodeId,
      nodeType,
      timestamp: new Date().toISOString(),
      message: `开始执行节点: ${node.data?.label || nodeType}`,
    });

    let result: any;

    try {
      switch (nodeType) {
        case 'start':
          result = await this.executeStartNode(node, context);
          break;
        case 'end':
          result = await this.executeEndNode(node, context);
          break;
        case 'llm':
          result = await this.executeLLMNode(node, context);
          break;
        case 'condition':
          result = await this.executeConditionNode(node, context);
          break;
        case 'http':
          result = await this.executeHttpNode(node, context);
          break;
        case 'loop':
          result = await this.executeLoopNode(node, context);
          break;
        case 'parallel':
          result = await this.executeParallelNode(node, context);
          break;
        case 'transform':
          result = await this.executeTransformNode(node, context);
          break;
        case 'database':
          result = await this.executeDatabaseNode(node, context);
          break;
        default:
          throw new Error(`不支持的节点类型: ${nodeType}`);
      }

      // 保存节点执行结果
      context.nodeResults.set(nodeId, result);

      // 记录成功日志
      context.executionLog.push({
        nodeId,
        nodeType,
        timestamp: new Date().toISOString(),
        message: `节点执行成功: ${node.data?.label || nodeType}`,
        result,
      });

      // 执行后续节点
      const nextNodes = edgeMap.get(nodeId) || [];
      console.log(`节点 ${nodeId} (${nodeType}) 的后续节点:`, nextNodes);

      if (nextNodes.length > 0) {
        // 根据节点类型决定执行策略
        if (nodeType === 'condition') {
          // 条件节点：根据条件结果选择执行路径
          const conditionResult = result.conditionResult;
          const nextNodeId = conditionResult ? nextNodes[0] : nextNodes[1];
          if (nextNodeId) {
            const nextNode = nodeMap.get(nextNodeId);
            if (nextNode) {
              return await this.executeNode(nextNode, context, nodeMap, edgeMap);
            }
          }
        } else if (nodeType === 'loop') {
          // 循环节点：根据循环条件决定是否继续
          if (result.shouldContinue) {
            return await this.executeNode(node, context, nodeMap, edgeMap);
          } else if (nextNodes.length > 0) {
            const nextNode = nodeMap.get(nextNodes[0]);
            if (nextNode) {
              return await this.executeNode(nextNode, context, nodeMap, edgeMap);
            }
          }
        } else if (nodeType === 'parallel') {
          // 并行节点：并行执行所有后续节点
          const parallelResults = await Promise.all(
            nextNodes.map((nextNodeId) => {
              const nextNode = nodeMap.get(nextNodeId);
              return nextNode ? this.executeNode(nextNode, context, nodeMap, edgeMap) : null;
            }),
          );
          return parallelResults.filter((r) => r !== null);
        } else {
          // 普通节点：顺序执行第一个后续节点
          const nextNode = nodeMap.get(nextNodes[0]);
          if (nextNode) {
            return await this.executeNode(nextNode, context, nodeMap, edgeMap);
          }
        }
      }

      return result;
    } catch (error) {
      // 记录错误日志
      context.executionLog.push({
        nodeId,
        nodeType,
        timestamp: new Date().toISOString(),
        message: `节点执行失败: ${error.message}`,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 执行开始节点
   */
  private async executeStartNode(node: any, context: any): Promise<any> {
    const inputs = context.inputs;
    const variableName = node.data?.config?.variableName || 'input';

    // 根据输入类型处理数据
    const inputType = node.data?.config?.inputType || 'text';
    let processedInput = inputs;

    if (inputType === 'text' && typeof inputs === 'string') {
      processedInput = { [variableName]: inputs };
    } else if (inputType === 'number' && typeof inputs === 'number') {
      processedInput = { [variableName]: inputs };
    } else if (inputType === 'boolean' && typeof inputs === 'boolean') {
      processedInput = { [variableName]: inputs };
    }

    return {
      type: 'start',
      data: processedInput,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 执行结束节点
   */
  private async executeEndNode(node: any, context: any): Promise<any> {
    // 获取最后一个非结束节点的结果
    let lastResult = context.inputs;
    for (const [nodeId, result] of context.nodeResults) {
      if (result.type !== 'end') {
        lastResult = result;
      }
    }

    console.log('结束节点执行，可用的节点结果:', Array.from(context.nodeResults.entries()));
    console.log('结束节点选择的结果:', lastResult);

    // 如果最后一个结果是LLM节点，提取其输出
    let finalOutput = lastResult;
    if (lastResult && lastResult.type === 'llm' && lastResult.data) {
      const llmData = lastResult.data;
      finalOutput = {
        output: llmData.response || '',
        reasoning_content: llmData.reasoning_content || '',
      };
    }

    return {
      type: 'end',
      data: finalOutput,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 调用LLM API
   */
  private async callLLMAPI(requestData: any): Promise<{ output: string; reasoning_content: string }> {
    // 这里需要实现真正的LLM API调用
    // 暂时返回模拟数据，实际应该调用类似 debugChat 的逻辑
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          output: `您好！很高兴见到您。我是DeepSeek-R1，有什么我可以帮您的吗？😊`,
          reasoning_content: `嗯，用户发来一句简单的问候"你好"，这可能是ta第一次接触这个AI助手，或者只是想测试一下交互功能。作为DeepSeek AI助手，我需要用温暖专业的语气建立信任感。\n\n用户没有提供具体问题或话题，说明ta可能处于探索阶段。这种情况下，保持开放式的回应比较合适——既要表达欢迎之意，又要引导用户展开对话。可以适当加入一些轻松的表情符号增加亲和力。\n\n考虑到中文问候习惯，用户可能是中国人或讲中文的使用者。虽然无法确定具体身份，但用"您好"回应是合适的，既保持礼貌又符合AI助手的定位。回复中应该包含：问候、自我介绍（DeepSeek-R1）、开放提问邀请，最后加个友好的表情符号。\n\n用户此刻的情绪应该是中性偏积极的，毕竟主动打招呼的人通常心情不错。要避免过于热情显得假，也不能太冷淡让人失去交流兴趣。\n\n这个简单问候背后可能隐藏着几种需求：可能是想确认AI能否正常对话，也可能是带着某个具体问题但先用打招呼暖场。所以回复要同时完成破冰和功能说明，给用户留下提问空间。\n\n对了，还要注意保持专业性。虽然可以用活泼语气，但任何拟人化表达都要建立在"AI工具"的认知基础上。最后那个😊表情很关键，既能缓和气氛又不会显得过度拟人。`,
        });
      }, 1000);
    });
  }

  /**
   * 执行LLM节点
   */
  private async executeLLMNode(node: any, context: any): Promise<any> {
    console.log('开始执行LLM节点:', { id: node.id, config: node.data?.config });

    const config = node.data?.config || {};
    const {
      model,
      temperature,
      maxTokens,
      topP,
      systemPrompt,
      userPrompt,
      outputVariable,
      outputType,
      variableName,
      inputType,
    } = config;

    console.log('LLM节点配置:', { model, temperature, maxTokens, systemPrompt, userPrompt });

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'llm',
      timestamp: new Date().toISOString(),
      message: `LLM节点配置: 模型="${model}", 温度=${temperature}, 最大token=${maxTokens}`,
      config: config,
    });

    // 获取输入数据
    const inputData = this.getVariableValue(variableName || 'input', context);

    // 构建提示词
    let finalPrompt = '';
    if (systemPrompt) {
      finalPrompt += `系统提示: ${systemPrompt}\n\n`;
    }
    if (userPrompt) {
      // 替换用户提示词中的变量引用
      finalPrompt += this.replaceVariables(userPrompt, context);
    } else {
      finalPrompt += String(inputData);
    }

    // 记录提示词构建过程
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'llm',
      timestamp: new Date().toISOString(),
      message: `提示词构建完成: ${finalPrompt.length} 字符`,
      prompt: finalPrompt,
    });

    // 构建消息数组
    const messages: Array<{ role: string; content: string }> = [];

    // 添加系统提示词
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // 添加用户输入
    const userContent = userPrompt ? this.replaceVariables(userPrompt, context) : String(inputData);

    messages.push({
      role: 'user',
      content: userContent,
    });

    // 构建请求数据
    const requestData = {
      model: model || 'lingmengcan',
      messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 4096,
      top_p: topP || 1,
    };

    // 记录API调用
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'llm',
      timestamp: new Date().toISOString(),
      message: `调用LLM API: 模型=${model}, 消息数=${messages.length}`,
      requestData,
    });

    try {
      // 调用LLM API
      const response = await this.callLLMAPI(requestData);

      // 记录LLM响应
      context.executionLog.push({
        nodeId: node.id,
        nodeType: 'llm',
        timestamp: new Date().toISOString(),
        message: `LLM响应完成: ${response.output?.length || 0} 字符`,
        response: response,
      });

      const result = {
        type: 'llm',
        data: {
          model,
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 4096,
          topP: topP || 1,
          systemPrompt,
          userPrompt,
          inputData,
          finalPrompt,
          response: response.output || '',
          reasoning_content: response.reasoning_content || '',
          outputVariable: outputVariable || 'output',
          outputType: outputType || 'text',
          timestamp: new Date().toISOString(),
        },
      };

      console.log('LLM节点执行完成，返回结果:', result);
      return result;
    } catch (error) {
      // 记录错误
      context.executionLog.push({
        nodeId: node.id,
        nodeType: 'llm',
        timestamp: new Date().toISOString(),
        message: `LLM API调用失败: ${error.message}`,
        error: error.message,
      });

      const result = {
        type: 'llm',
        data: {
          model,
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 4096,
          topP: topP || 1,
          systemPrompt,
          userPrompt,
          inputData,
          finalPrompt,
          response: `错误: ${error.message}`,
          reasoning_content: '',
          outputVariable: outputVariable || 'output',
          outputType: outputType || 'text',
          timestamp: new Date().toISOString(),
        },
      };

      console.log('LLM节点执行失败，返回错误结果:', result);
      return result;
    }
  }

  /**
   * 执行条件节点
   */
  private async executeConditionNode(node: any, context: any): Promise<any> {
    const config = node.data?.config || {};
    const conditions = config.conditions || [];

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'condition',
      timestamp: new Date().toISOString(),
      message: `条件节点配置: ${conditions.length} 个条件`,
      config: config,
    });

    let conditionResult = false;
    const conditionResults = [];

    for (const condition of conditions) {
      const { variable, operator, value, logicalOperator } = condition;
      const variableValue = this.getVariableValue(variable, context);

      let result = false;
      switch (operator) {
        case '==':
          result = variableValue == value;
          break;
        case '!=':
          result = variableValue != value;
          break;
        case '>':
          result = variableValue > value;
          break;
        case '<':
          result = variableValue < value;
          break;
        case '>=':
          result = variableValue >= value;
          break;
        case '<=':
          result = variableValue <= value;
          break;
        case 'contains':
          result = String(variableValue).includes(String(value));
          break;
        case 'startsWith':
          result = String(variableValue).startsWith(String(value));
          break;
        case 'endsWith':
          result = String(variableValue).endsWith(String(value));
          break;
      }

      conditionResults.push({
        variable,
        operator,
        value,
        variableValue,
        result,
        logicalOperator,
      });

      if (logicalOperator === 'AND') {
        conditionResult = conditionResult && result;
      } else if (logicalOperator === 'OR') {
        conditionResult = conditionResult || result;
      } else {
        conditionResult = result;
      }
    }

    // 记录条件评估结果
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'condition',
      timestamp: new Date().toISOString(),
      message: `条件评估结果: ${conditionResult}`,
      conditionResults: conditionResults,
    });

    return {
      type: 'condition',
      data: {
        conditions,
        conditionResults,
        conditionResult,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 执行HTTP节点
   */
  private async executeHttpNode(node: any, context: any): Promise<any> {
    const config = node.data?.config || {};
    const { method, url, headers, body, timeout = 30000, retryCount = 0 } = config;

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'http',
      timestamp: new Date().toISOString(),
      message: `HTTP节点配置: ${method} ${url}`,
      config: config,
    });

    // 这里应该调用实际的HTTP请求
    // 暂时返回模拟结果
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = {
      message: 'HTTP请求成功',
      method,
      url,
      status: 200,
      headers: headers || {},
      body: body || null,
    };

    // 记录HTTP请求结果
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'http',
      timestamp: new Date().toISOString(),
      message: `HTTP请求完成: ${method} ${url} - 状态: 200`,
      response: response,
    });

    return {
      type: 'http',
      data: {
        method,
        url,
        headers: headers || {},
        body: body || null,
        timeout,
        retryCount,
        status: 200,
        response,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 执行循环节点
   */
  private async executeLoopNode(node: any, context: any): Promise<any> {
    const config = node.data?.config || {};
    const { maxIterations = 10, condition, loopType, variableName } = config;

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'loop',
      timestamp: new Date().toISOString(),
      message: `循环节点配置: 类型=${loopType || 'count'}, 最大迭代=${maxIterations}`,
      config: config,
    });

    const currentIteration = context.variables[`${node.id}_iteration`] || 0;
    const newIteration = currentIteration + 1;

    let shouldContinue = false;
    if (loopType === 'count') {
      shouldContinue = newIteration < maxIterations;
    } else if (loopType === 'condition') {
      shouldContinue = this.evaluateCondition(condition, context);
    } else {
      // 默认按次数循环
      shouldContinue = newIteration < maxIterations;
    }

    context.variables[`${node.id}_iteration`] = newIteration;

    // 记录循环状态
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'loop',
      timestamp: new Date().toISOString(),
      message: `循环状态: 当前迭代=${newIteration}, 是否继续=${shouldContinue}`,
      iteration: newIteration,
      shouldContinue: shouldContinue,
    });

    return {
      type: 'loop',
      data: {
        loopType: loopType || 'count',
        maxIterations,
        condition,
        variableName,
        iteration: newIteration,
        shouldContinue,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 执行并行节点
   */
  private async executeParallelNode(node: any, context: any): Promise<any> {
    const config = node.data?.config || {};
    const { parallelCount = 2, parallelType = 'fixed' } = config;

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'parallel',
      timestamp: new Date().toISOString(),
      message: `并行节点配置: 类型=${parallelType}, 并行数=${parallelCount}`,
      config: config,
    });

    // 模拟并行执行
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results = Array(parallelCount)
      .fill(null)
      .map((_, index) => ({
        id: `parallel_${index + 1}`,
        status: 'completed',
        result: `并行任务 ${index + 1} 完成`,
        timestamp: new Date().toISOString(),
      }));

    // 记录并行执行结果
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'parallel',
      timestamp: new Date().toISOString(),
      message: `并行执行完成: ${results.length} 个任务`,
      results: results,
    });

    return {
      type: 'parallel',
      data: {
        parallelType,
        parallelCount,
        results,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 执行转换节点
   */
  private async executeTransformNode(node: any, context: any): Promise<any> {
    const config = node.data?.config || {};
    const { transformation, transformationType = 'json' } = config;

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'transform',
      timestamp: new Date().toISOString(),
      message: `转换节点配置: 类型=${transformationType}`,
      config: config,
    });

    let result = context.inputs;

    if (transformation) {
      try {
        // 执行数据转换逻辑
        result = this.applyTransformation(transformation, context);

        // 记录转换结果
        context.executionLog.push({
          nodeId: node.id,
          nodeType: 'transform',
          timestamp: new Date().toISOString(),
          message: `数据转换完成`,
          input: context.inputs,
          output: result,
        });
      } catch (error) {
        context.executionLog.push({
          nodeId: node.id,
          nodeType: 'transform',
          timestamp: new Date().toISOString(),
          message: `数据转换失败: ${error.message}`,
          error: error.message,
        });
        throw new Error(`数据转换失败: ${error.message}`);
      }
    }

    return {
      type: 'transform',
      data: {
        transformationType,
        input: context.inputs,
        output: result,
        transformation,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 执行数据库节点
   */
  private async executeDatabaseNode(node: any, context: any): Promise<any> {
    const config = node.data?.config || {};
    const { operation, table, query, connectionString, timeout = 30000 } = config;

    // 记录节点配置信息
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'database',
      timestamp: new Date().toISOString(),
      message: `数据库节点配置: 操作=${operation}, 表=${table}`,
      config: config,
    });

    // 这里应该执行实际的数据库操作
    // 暂时返回模拟结果
    await new Promise((resolve) => setTimeout(resolve, 200));

    const result = {
      affectedRows: 1,
      message: '数据库操作成功',
      operation,
      table,
      query: query || 'SELECT * FROM ' + table,
    };

    // 记录数据库操作结果
    context.executionLog.push({
      nodeId: node.id,
      nodeType: 'database',
      timestamp: new Date().toISOString(),
      message: `数据库操作完成: ${operation} ${table}`,
      result: result,
    });

    return {
      type: 'database',
      data: {
        operation,
        table,
        query,
        connectionString,
        timeout,
        result,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 获取变量值
   */
  private getVariableValue(variable: string, context: any): any {
    // 从上下文中的各种来源获取变量值
    if (context.inputs && context.inputs[variable] !== undefined) {
      return context.inputs[variable];
    }
    if (context.variables && context.variables[variable] !== undefined) {
      return context.variables[variable];
    }
    if (context.nodeResults && context.nodeResults.has(variable)) {
      return context.nodeResults.get(variable);
    }
    return undefined;
  }

  /**
   * 替换提示词中的变量引用
   */
  private replaceVariables(template: string, context: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variablePath) => {
      const trimmedPath = variablePath.trim();

      // 处理嵌套属性访问，如 {{variable.subProperty}} 或 {{variable[0]}}
      if (trimmedPath.includes('.') || trimmedPath.includes('[')) {
        return this.getNestedVariableValue(trimmedPath, context);
      }

      // 处理简单变量
      const value = this.getVariableValue(trimmedPath, context);
      return value !== null && value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取嵌套变量值
   */
  private getNestedVariableValue(path: string, context: any): any {
    try {
      // 处理数组索引访问，如 variable[0]
      const arrayIndexMatch = path.match(/^([^[]+)\[(\d+)\]$/);
      if (arrayIndexMatch) {
        const [, variableName, index] = arrayIndexMatch;
        const arrayValue = this.getVariableValue(variableName, context);
        if (Array.isArray(arrayValue)) {
          return arrayValue[parseInt(index)] || '';
        }
        return '';
      }

      // 处理对象属性访问，如 variable.subProperty
      const parts = path.split('.');
      let current = this.getVariableValue(parts[0], context);

      for (let i = 1; i < parts.length; i++) {
        if (current && typeof current === 'object') {
          current = current[parts[i]];
        } else {
          return '';
        }
      }

      return current !== null && current !== undefined ? String(current) : '';
    } catch (error) {
      return '';
    }
  }

  /**
   * 评估条件
   */
  private evaluateCondition(condition: string, context: any): boolean {
    // 简单的条件评估逻辑
    // 在实际应用中，这里应该使用更安全的表达式解析器
    try {
      // 替换变量
      let expression = condition;
      Object.keys(context.variables).forEach((key) => {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(context.variables[key]));
      });

      // 简单的表达式求值（仅用于演示，生产环境应使用更安全的解析器）
      return eval(expression);
    } catch (error) {
      return false;
    }
  }

  /**
   * 应用数据转换
   */
  private applyTransformation(transformation: string, context: any): any {
    // 简单的数据转换逻辑
    // 在实际应用中，这里应该使用更安全的方式
    try {
      const func = new Function('data', 'context', transformation);
      return func(context.inputs, context);
    } catch (error) {
      throw new Error(`转换函数执行失败: ${error.message}`);
    }
  }

  /**
   * 获取工作流执行历史
   */
  async getExecutions(dto: WorkflowExecutionListDto) {
    const { workflowId, page, pageSize } = dto;

    const [list, count] = await this.workflowExecutionRepository.findAndCount({
      where: { workflowId },
      order: { startTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list,
      count,
      page,
      pageSize,
    };
  }

  /**
   * 停止工作流执行
   */
  async stopExecution(executionId: string): Promise<boolean> {
    const execution = await this.workflowExecutionRepository.findOne({
      where: { executionId },
    });

    if (!execution) {
      throw new Error('执行记录不存在');
    }

    if (execution.status !== 0) {
      throw new Error('执行已结束，无法停止');
    }

    execution.status = 3; // 已停止
    execution.endTime = new Date();
    execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);

    await this.workflowExecutionRepository.save(execution);
    return true;
  }
}
