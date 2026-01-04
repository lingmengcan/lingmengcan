import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, WorkflowStatus } from './workflow.entity';
import { WorkflowExecution, ExecutionStatus } from './workflow-execution.entity';
import { WorkflowExecutionEngine } from './engine/workflow-execution-engine';
import {
  WorkflowListDto,
  WorkflowDto,
  WorkflowExecuteDto,
  WorkflowExecutionListDto,
  WorkflowCopyDto,
} from './workflow.dto';

// 存储正在执行的任务，用于取消执行
const runningExecutions = new Map<string, AbortController>();

// 默认执行超时时间（毫秒）
const DEFAULT_EXECUTION_TIMEOUT = 60000;

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private readonly workflowExecutionRepository: Repository<WorkflowExecution>,
    private readonly executionEngine: WorkflowExecutionEngine,
  ) {}

  /**
   * 获取工作流列表
   */
  async findAll(dto: WorkflowListDto, userName?: string) {
    const { workflowName, status, page, pageSize } = dto;
    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');

    if (workflowName) {
      queryBuilder.andWhere('workflow.workflowName LIKE :workflowName', { workflowName: `%${workflowName}%` });
    }

    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('workflow.status = :status', { status });
    }

    // 可选：按创建者过滤
    if (userName) {
      queryBuilder.andWhere('workflow.createdUser = :userName', { userName });
    }

    queryBuilder
      .orderBy('workflow.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, count] = await queryBuilder.getManyAndCount();
    return { list, count, page, pageSize };
  }

  /**
   * 根据ID获取工作流详情
   */
  async findOne(workflowId: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({ where: { workflowId } });
    if (!workflow) {
      throw new NotFoundException('工作流不存在');
    }
    return workflow;
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
    workflow.status = WorkflowStatus.DRAFT;
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

    workflow.workflowName = dto.workflowName;
    workflow.description = dto.description ?? workflow.description;
    workflow.version = dto.version ?? workflow.version;
    workflow.status = dto.status !== undefined ? dto.status : workflow.status;
    workflow.config = dto.config ?? workflow.config;
    workflow.updatedUser = userName;
    return await this.workflowRepository.save(workflow);
  }

  /**
   * 删除工作流
   */
  async remove(workflowId: string): Promise<boolean> {
    // 先检查工作流是否存在
    await this.findOne(workflowId);
    
    const result = await this.workflowRepository.delete({ workflowId });
    return result.affected > 0;
  }

  /**
   * 复制工作流
   */
  async copy(dto: WorkflowCopyDto, userName: string): Promise<Workflow> {
    const originalWorkflow = await this.findOne(dto.workflowId);

    const newWorkflow = new Workflow();
    newWorkflow.workflowId = uuidv4();
    newWorkflow.workflowName = dto.newName;
    newWorkflow.description = originalWorkflow.description;
    newWorkflow.version = originalWorkflow.version;
    newWorkflow.status = WorkflowStatus.DRAFT;
    newWorkflow.config = JSON.parse(JSON.stringify(originalWorkflow.config)); // 深拷贝配置
    newWorkflow.createdUser = userName;
    newWorkflow.updatedUser = userName;
    return await this.workflowRepository.save(newWorkflow);
  }

  /**
   * 发布工作流
   */
  async publish(workflowId: string, userName: string): Promise<boolean> {
    const workflow = await this.findOne(workflowId);
    
    // 验证工作流配置
    this.validateWorkflowConfig(workflow);
    
    workflow.status = WorkflowStatus.PUBLISHED;
    workflow.updatedUser = userName;
    await this.workflowRepository.save(workflow);
    return true;
  }

  /**
   * 取消发布工作流
   */
  async unpublish(workflowId: string, userName: string): Promise<boolean> {
    const workflow = await this.findOne(workflowId);
    
    workflow.status = WorkflowStatus.DRAFT;
    workflow.updatedUser = userName;
    await this.workflowRepository.save(workflow);
    return true;
  }

  /**
   * 验证工作流配置
   */
  private validateWorkflowConfig(workflow: Workflow): void {
    const { config } = workflow;
    
    if (!config || !config.nodes || config.nodes.length === 0) {
      throw new BadRequestException('工作流配置无效：没有节点');
    }

    const hasStartNode = config.nodes.some((node) => node.type === 'start');
    if (!hasStartNode) {
      throw new BadRequestException('工作流配置无效：缺少开始节点');
    }

    const hasEndNode = config.nodes.some((node) => node.type === 'end');
    if (!hasEndNode) {
      throw new BadRequestException('工作流配置无效：缺少结束节点');
    }
  }

  /**
   * 执行工作流
   */
  async execute(dto: WorkflowExecuteDto, userName: string, isDebug: boolean = false): Promise<WorkflowExecution> {
    const workflow = await this.findOne(dto.workflowId);

    if (!isDebug && workflow.status !== WorkflowStatus.PUBLISHED) {
      throw new BadRequestException('工作流未发布，无法执行');
    }

    const execution = new WorkflowExecution();
    execution.executionId = uuidv4();
    execution.workflowId = dto.workflowId;
    execution.inputs = dto.inputs || {};
    execution.status = ExecutionStatus.RUNNING;
    execution.startTime = new Date();
    execution.createdUser = userName;

    await this.workflowExecutionRepository.save(execution);
    
    // 启动异步执行
    this.executeWorkflowAsync(workflow, execution, dto.inputs, dto.timeout);
    
    return execution;
  }

  /**
   * 同步执行工作流
   */
  async executeSync(dto: WorkflowExecuteDto, _userName: string): Promise<any> {
    const workflow = await this.findOne(dto.workflowId);

    const executionId = uuidv4();
    const startTime = Date.now();
    const timeout = dto.timeout || DEFAULT_EXECUTION_TIMEOUT;

    try {
      const result = await this.executeWithTimeout(
        this.executionEngine.execute(workflow, dto.inputs),
        timeout,
      );
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      return {
        executionId,
        workflowId: dto.workflowId,
        parameters: dto.inputs,
        output: result.outputs?.result || result.result || '',
        executionLog: result.outputs?.executionLog || result.executionLog || [],
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('工作流同步执行失败:', error);
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      return {
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
    }
  }

  /**
   * 调试执行工作流
   */
  async debugExecute(dto: WorkflowExecuteDto, _userName: string): Promise<any> {
    const workflow = await this.findOne(dto.workflowId);
    const timeout = dto.timeout || DEFAULT_EXECUTION_TIMEOUT;

    try {
      const result = await this.executeWithTimeout(
        this.executionEngine.execute(workflow, dto.inputs),
        timeout,
      );

      let finalOutput = '';
      if (result.result && typeof result.result === 'object') {
        if (result.result.type === 'end' && result.result.data) {
          finalOutput = result.result.data.output || '';
        } else if (result.result.output) {
          finalOutput = result.result.output;
        } else {
          finalOutput = JSON.stringify(result.result);
        }
      } else if (typeof result.result === 'string') {
        finalOutput = result.result;
      }

      return {
        executionId: uuidv4(),
        workflowId: dto.workflowId,
        inputs: dto.inputs,
        status: ExecutionStatus.SUCCESS,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        output: finalOutput,
        executionLog: result.executionLog || [],
        variables: result.variables || {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('调试执行失败:', error);
      return {
        executionId: uuidv4(),
        workflowId: dto.workflowId,
        inputs: dto.inputs,
        status: ExecutionStatus.FAILED,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        output: '',
        executionLog: [
          {
            nodeId: 'error',
            nodeType: 'error',
            timestamp: new Date().toISOString(),
            message: `调试执行失败: ${error.message}`,
            error: error.message,
          },
        ],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 流式执行工作流
   */
  async *executeStream(dto: WorkflowExecuteDto): AsyncGenerator<string> {
    const workflow = await this.findOne(dto.workflowId);

    yield* this.executionEngine.executeStream(workflow, dto.inputs);
  }

  /**
   * 带超时的执行
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`执行超时（${timeout / 1000}秒）`)), timeout),
      ),
    ]);
  }

  /**
   * 异步执行工作流
   */
  private async executeWorkflowAsync(
    workflow: Workflow,
    execution: WorkflowExecution,
    inputs: any,
    timeout?: number,
  ) {
    const abortController = new AbortController();
    runningExecutions.set(execution.executionId, abortController);
    
    const executionTimeout = timeout || DEFAULT_EXECUTION_TIMEOUT;
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, executionTimeout);

    try {
      const result = await this.executeWithTimeout(
        this.executionEngine.execute(workflow, inputs),
        executionTimeout,
      );
      
      // 检查是否被取消
      if (abortController.signal.aborted) {
        return;
      }
      
      execution.status = ExecutionStatus.SUCCESS;
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.outputs = result;
      await this.workflowExecutionRepository.save(execution);
    } catch (error) {
      console.error('工作流执行失败:', error);
      
      // 检查是否被取消
      const isStopped = abortController.signal.aborted;
      
      execution.status = error.message?.includes('超时') 
        ? ExecutionStatus.TIMEOUT 
        : (isStopped ? ExecutionStatus.STOPPED : ExecutionStatus.FAILED);
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.errorMessage = error.message;
      await this.workflowExecutionRepository.save(execution);
    } finally {
      clearTimeout(timeoutId);
      runningExecutions.delete(execution.executionId);
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

    return { list, count, page, pageSize };
  }

  /**
   * 停止工作流执行
   */
  async stopExecution(executionId: string): Promise<boolean> {
    const execution = await this.workflowExecutionRepository.findOne({ where: { executionId } });
    if (!execution) {
      throw new NotFoundException('执行记录不存在');
    }
    if (execution.status !== ExecutionStatus.RUNNING) {
      throw new BadRequestException('执行已结束，无法停止');
    }

    // 尝试取消正在运行的任务
    const abortController = runningExecutions.get(executionId);
    if (abortController) {
      abortController.abort();
      runningExecutions.delete(executionId);
    }

    execution.status = ExecutionStatus.STOPPED;
    execution.endTime = new Date();
    execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
    execution.errorMessage = '用户手动停止执行';
    await this.workflowExecutionRepository.save(execution);
    return true;
  }
}