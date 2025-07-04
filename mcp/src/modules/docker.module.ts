import { Module } from '@nestjs/common';
import { DockerService } from 'src/services/docker.service';

@Module({
  imports: [],
  providers: [DockerService],
  exports: [DockerService],
})
export class DockerModule {}
