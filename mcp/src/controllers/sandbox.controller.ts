import { Body, Controller, Post, Delete, Param, Get } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SandboxService } from 'src/services/sandbox.service';

@Controller('sandbox')
@ApiTags('沙箱')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('create')
  @ApiOperation({ summary: '创建沙箱' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '用户代码' },
      },
      required: ['code'],
    },
  })
  async create(@Body() body: { code: string }): Promise<{ id: string }> {
    if (!body?.code) {
      throw new Error('代码不能为空');
    }
    console.log('Creating sandbox with code:', body.code);
    const containerId = await this.sandboxService.createSandboxSync(body.code);
    return { id: containerId };
  }

  @Get('list')
  async listAllSandboxes() {
    return this.sandboxService.listSandboxes();
  }

  @Get(':id')
  async getSandboxStatus(@Param('id') id: string) {
    return this.sandboxService.getSandboxStatus(id);
  }

  @Delete('del/:id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.sandboxService.deleteSandbox(id);
  }
}
