import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { ConversationService } from './conversation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
