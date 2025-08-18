import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { WorkflowService } from '@/services/workflow.service';
import { WorkflowAppListDto, WorkflowAppDto, WorkflowExecuteDto, WorkflowExecutionListDto, WorkflowAppCopyDto } from '@/dtos/workflow.dto';
import { successJson } from '@/utils/result';

@ApiTags('llm')
@Controller('llm')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * 获取工作流应用列表
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-list')
  async getWorkflowAppList(@Body() dto: WorkflowAppListDto) {
    return successJson(await this.workflowService.findAll(dto));
  }

  /**
   * 获取工作流应用详情
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-detail')
  async getWorkflowAppDetail(@Body() body: { appId: string }) {
    return successJson(await this.workflowService.findOne(body.appId));
  }

  /**
   * 新增工作流应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-add')
  async addWorkflowApp(@Body() dto: WorkflowAppDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.create(dto, userName));
  }

  /**
   * 编辑工作流应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-edit')
  async editWorkflowApp(@Body() dto: WorkflowAppDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.update(dto, userName));
  }

  /**
   * 删除工作流应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-delete')
  async deleteWorkflowApp(@Body() body: { appId: string }) {
    return successJson(await this.workflowService.remove(body.appId));
  }

  /**
   * 复制工作流应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-copy')
  async copyWorkflowApp(@Body() body: WorkflowAppCopyDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.copy(body.appId, body.newName, userName));
  }

  /**
   * 发布工作流应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-publish')
  async publishWorkflowApp(@Body() body: { appId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.publish(body.appId, userName));
  }

  /**
   * 取消发布工作流应用
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-app-unpublish')
  async unpublishWorkflowApp(@Body() body: { appId: string }, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.unpublish(body.appId, userName));
  }

  /**
   * 执行工作流
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-execute')
  async executeWorkflow(@Body() dto: WorkflowExecuteDto, @Request() req: any) {
    const userName = req.user.userName;
    return successJson(await this.workflowService.execute(dto, userName));
  }

  /**
   * 获取工作流执行历史
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-executions')
  async getWorkflowExecutions(@Body() dto: WorkflowExecutionListDto) {
    return successJson(await this.workflowService.getExecutions(dto));
  }

  /**
   * 停止工作流执行
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('workflow-execution-stop')
  async stopWorkflowExecution(@Body() body: { executionId: string }) {
    return successJson(await this.workflowService.stopExecution(body.executionId));
  }
}