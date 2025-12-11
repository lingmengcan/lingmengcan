import { Media } from './media.entity';
import { MediaService } from './media.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'aigc-files'),
      // Tell NestJS to serve the files under ~/aigc-files/
      serveRoot: '/aigc-files/',
    }),
    TypeOrmModule.forFeature([Media]),
  ],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
