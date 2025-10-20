import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plugin } from './plugin.entity';
import { PluginController } from './plugin.controller';
import { PluginService } from './plugin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plugin])],
  controllers: [PluginController],
  providers: [PluginService],
  exports: [PluginService],
})
export class PluginModule {}