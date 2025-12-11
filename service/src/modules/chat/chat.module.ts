import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ModelModule } from '../model/model.module';
import { Conversation } from './conversation/conversation.entity';
import { Message } from './message/message.entity';
import { ConversationService } from './conversation/conversation.service';
import { MessageService } from './message/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    ConfigModule,
    ModelModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ConversationService, MessageService],
  exports: [ChatService, ConversationService, MessageService],
})
export class ChatModule {}
