import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Workflow } from '@/entities/workflow.entity';
import { WorkflowExecution } from '@/entities/workflow-execution.entity';
import { WorkflowNodeType } from '@/entities/workflow-node-type.entity';
import { 
  WorkflowListDto, 
  WorkflowDto, 
  WorkflowExecuteDto, 
  WorkflowExecutionListDto,
  WorkflowCopyDto,
  NodeTypeListDto
} from '@/dtos/workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private readonly workflowExecutionRepository: Repository<WorkflowExecution>,
    @InjectRepository(WorkflowNodeType)
    private readonly workflowNodeTypeRepository: Repository<WorkflowNodeType>,
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
  async execute(dto: WorkflowExecuteDto, userName: string): Promise<WorkflowExecution> {
    const workflow = await this.findOne(dto.workflowId);
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    if (workflow.status !== 1) {
      throw new Error('工作流未发布，无法执行');
    }

    const execution = new WorkflowExecution();
    execution.executionId = uuidv4();
    execution.workflowId = dto.workflowId;
    execution.inputs = dto.inputs;
    execution.status = 0; // 运行中
    execution.startTime = new Date();
    execution.createdUser = userName;

    // 这里应该实现实际的工作流执行逻辑
    // 暂时模拟执行成功
    setTimeout(async () => {
      execution.status = 1; // 成功
      execution.endTime = new Date();
      execution.duration = Math.floor((execution.endTime.getTime() - execution.startTime.getTime()) / 1000);
      execution.outputs = { result: '执行成功' };
      await this.workflowExecutionRepository.save(execution);
    }, 2000);

    return await this.workflowExecutionRepository.save(execution);
  }

  /**
   * 获取工作流执行历史
   */
  async getExecutions(dto: WorkflowExecutionListDto) {
    const { workflowId, page, pageSize } = dto;
    
    const [list, count] = await this.workflowExecutionRepository.findAndCount({
      where: { workflowId },
      order: { createdAt: 'DESC' },
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

  /**
   * 获取节点类型列表
   */
  async getNodeTypes(dto: NodeTypeListDto) {
    const { category } = dto;
    
    const queryBuilder = this.workflowNodeTypeRepository.createQueryBuilder('nodeType');
    
    if (category) {
      queryBuilder.andWhere('nodeType.category = :category', { category });
    }
    
    queryBuilder.orderBy('nodeType.nodeName', 'ASC');
    
    return await queryBuilder.getMany();
  }
}