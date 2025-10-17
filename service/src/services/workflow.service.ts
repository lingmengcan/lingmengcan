import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Workflow } from '@/entities/workflow.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { WorkflowExecutionEngine } from './workflow/workflow-execution-engine';
import {
  WorkflowListDto,
  WorkflowDto,
  WorkflowExecuteDto,
  WorkflowExecutionListDto,
  WorkflowCopyDto,
} from '@/dtos/workflow.dto';

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
    return { list, count, page, pageSize };
  }

  /**
   * 根据ID获取工作流详情
   */
  async findOne(workflowId: string): Promise<Workflow> {
    return await this.workflowRepository.findOne({ where: { workflowId } });
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
    newWorkflow.status = 0;
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
    workflow.status = 1;
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
    workflow.status = 0;
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

    if (!isDebug && workflow.status !== 1) {
      throw new Error('工作流未发布，无法执行');
    }

    const execution = new WorkflowExecution();
    execution.executionId = uuidv4();
    execution.workflowId = dto.workflowId;
    execution.inputs = dto.inputs;
    execution.status = 0;
    execution.startTime = new Date();
    execution.createdUser = userName;

    await this.workflowExecutionRepository.save(execution);
    this.executeWorkflowAsync(workflow, execution, dto.inputs);
    return execution;
  }

  /**
   * 同步执行工作流
   */
  async executeSync(dto: WorkflowExecuteDto, userName: string): Promise<any> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: dto.workflowId });
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    const executionId = uuidv4();
    const startTime = Date.now();

    try {
      const result = await this.executionEngine.execute(workflow, dto.inputs);
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
  async debugExecute(dto: WorkflowExecuteDto, userName: string): Promise<any> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: dto.workflowId });
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    try {
      const result = await this.executionEngine.execute(workflow, dto.inputs);

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
        status: 1,
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
        status: 2,
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
    const workflow = await this.workflowRepository.findOneBy({ workflowId: dto.workflowId });
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    yield* this.executionEngine.executeStream(workflow, dto.inputs);
  }

  /**
   * 异步执行工作流
   */
  private async executeWorkflowAsync(workflow: Workflow, execution: WorkflowExecution, inputs: any) {
    try {
      const result = await this.executionEngine.execute(workflow, inputs);
      execution.status = 1;
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.outputs = result;
      await this.workflowExecutionRepository.save(execution);
    } catch (error) {
      console.error('工作流执行失败:', error);
      execution.status = 2;
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.errorMessage = error.message;
      await this.workflowExecutionRepository.save(execution);
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
      throw new Error('执行记录不存在');
    }
    if (execution.status !== 0) {
      throw new Error('执行已结束，无法停止');
    }

    execution.status = 3;
    execution.endTime = new Date();
    execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
    await this.workflowExecutionRepository.save(execution);
    return true;
  }
}