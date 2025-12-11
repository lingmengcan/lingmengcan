import { FileService } from './file.service';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { File } from './file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatModule } from '../chat/chat.module';
import { ModelModule } from '../model/model.module';
import fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory(configService: ConfigService) {
        return {
          storage: diskStorage({
            // 动态文件储存位置
            destination: (req, file, callback) => {
              const folderPath = configService.get<string>('files.destination') + '/' + dayjs().format('YYYY-MM-DD');
              // 自动创建目录，如果不存在
              if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
              }
              callback(null, folderPath);
            },
            //文件名定制
            filename: (req, file, callback) => {
              const path = uuidv4() + extname(file.originalname);
              callback(null, path);
            },
          }),
          // 文件名编码设置为 UTF-8
          fileFilter: (req, file, callback) => {
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            callback(null, true);
          },
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'upload-files'),
      // Tell NestJS to serve the files under ~/upload-files/
      serveRoot: '/upload-files/',
    }),
    ConfigModule,
    ChatModule,
    ModelModule,
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
