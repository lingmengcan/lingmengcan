import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlNetPreprocessor } from './control-net-preprocessor.entity';
import { ControlNetPreprocessorService } from './control-net-preprocessor.service';

@Module({
  imports: [TypeOrmModule.forFeature([ControlNetPreprocessor])],
  providers: [ControlNetPreprocessorService],
  exports: [ControlNetPreprocessorService],
})
export class ControlNetPreprocessorModule {}
