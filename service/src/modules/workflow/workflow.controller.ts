import { Body, Controller, Post, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import {
  WorkflowListDto,
  WorkflowDto,
  WorkflowExecuteDto,
  WorkflowExecutionListDto,
  WorkflowCopyDto,
  NodeTypeListDto,
} from './workflow.dto';
import { successJson } from '@/utils/result';

@ApiTags('workflow')
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * 获取工作流列表
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async getWorkflowList(@Body() dto: WorkflowListDto) {
    return successJson(await this.workflowService.findAll(dto));
  }

  /**
   * 获取工作流详情
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('detail')
  async getWorkflowDetail(@Body() body: { workflowId: string }) {
    return successJson(await this.workflowService.findOne(body.workflowId));
  }

  /**
   * 新增工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addWorkflow(@Body() dto: WorkflowDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.create(dto, userName));
  }

  /**
   * 编辑工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('edit')
  async editWorkflow(@Body() dto: WorkflowDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.update(dto, userName));
  }

  /**
   * 删除工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('delete')
  async deleteWorkflow(@Body() body: { workflowId: string }) {
    return successJson(await this.workflowService.remove(body.workflowId));
  }

  /**
   * 复制工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('copy')
  async copyWorkflow(@Body() body: WorkflowCopyDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.copy(body, userName));
  }

  /**
   * 发布工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('publish')
  async publishWorkflow(@Body() body: { workflowId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.publish(body.workflowId, userName));
  }

  /**
   * 取消发布工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('unpublish')
  async unpublishWorkflow(@Body() body: { workflowId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.unpublish(body.workflowId, userName));
  }

  /**
   * 执行工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('execute')
  async executeWorkflow(@Body() dto: WorkflowExecuteDto, @Request() req: any, @Res() res: Response) {
    const userName = req.user.userName;

    // 如果是流式输出，直接同步执行并返回结果
    if (dto.stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      try {
        const executionId = uuidv4();
        // 发送首帧元信息，包含执行ID与工作流ID
        res.write(`data: ${JSON.stringify({ meta: { executionId, workflowId: dto.workflowId } })}\n\n`);
        for await (const chunk of this.workflowService.executeStream(dto)) {
          // SSE 格式：data: <json>\n\n
          res.write(`data: ${chunk}\n\n`);
        }
        res.end();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: String(err?.message || err) })}\n\n`);
        res.end();
      }
      return;
    }

    // 否则异步执行
    return successJson(await this.workflowService.execute(dto, userName));
  }

  /**
   * 调试执行工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('debug-execute')
  async debugExecuteWorkflow(@Body() dto: WorkflowExecuteDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.debugExecute(dto, userName));
  }

  /**
   * 获取工作流执行历史
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('executions')
  async getWorkflowExecutions(@Body() dto: WorkflowExecutionListDto) {
    return successJson(await this.workflowService.getExecutions(dto));
  }

  /**
   * 停止工作流执行
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('execution-stop')
  async stopWorkflowExecution(@Body() body: { executionId: string }) {
    return successJson(await this.workflowService.stopExecution(body.executionId));
  }
}
