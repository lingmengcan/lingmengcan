import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { DataSource } from 'typeorm';
import { UserModule } from './modules/system/user/user.module';
import { MenuModule } from './modules/system/menu/menu.module';
import { RoleModule } from './modules/system/role/role.module';
import { ChatModule } from './modules/chat/chat.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { DictModule } from './modules/system/dict/dict.module';
import { FileModule } from './modules/file/file.module';
import { ModelModule } from './modules/model/model.module';
import { MediaModule } from './modules/draw/media/media.module';
import { DrawModule } from './modules/draw/draw.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ApplicationModule } from './modules/application/application.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { PluginModule } from './modules/plugin/plugin.module';
import { DatasourceModule } from './modules/datasource/datasource.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('mysql.host'),
        port: configService.get<number>('mysql.port'),
        username: configService.get<string>('mysql.username'),
        password: configService.get<string>('mysql.password'),
        database: configService.get<string>('mysql.database'),
        charset: configService.get<string>('mysql.charset'),
        entities: [join(__dirname, 'modules/**/*.entity.{ts,js}'), join(__dirname, 'entities/**/*.entity.{ts,js}')],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MenuModule,
    RoleModule,
    ChatModule,
    PromptModule,
    DictModule,
    FileModule,
    ModelModule,
    MediaModule,
    DrawModule,
    KnowledgeModule,
    ApplicationModule,
    WorkflowModule,
    PluginModule,
    DatasourceModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private readonly dataSource: DataSource,
    private configService: ConfigService,
  ) {}
}
