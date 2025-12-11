import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from './media/media.module';
import { DiffusionModel } from './diffusion-model.entity';
import { DiffusionModelService } from './diffusion-model.service';
import { StableDiffusionService } from './stable-diffusion/stable-diffusion.service';
import { ControlNetPreprocessor } from './stable-diffusion/control-net-preprocessor.entity';
import { ControlNetPreprocessorService } from './stable-diffusion/control-net-preprocessor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiffusionModel, ControlNetPreprocessor]),
    MediaModule,
  ],
  controllers: [DrawController],
  providers: [
    DrawService,
    DiffusionModelService,
    StableDiffusionService,
    ControlNetPreprocessorService,
  ],
  exports: [
    DrawService,
    DiffusionModelService,
    StableDiffusionService,
    ControlNetPreprocessorService,
  ],
})
export class DrawModule {}
