import { Message } from '@/entities/message.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  message: Message;
}

export class ChatGlmDto {
  message: string;
  @ApiProperty({
    example: [
      ['Human:xx', 'Assistant:xx'],
      ['Human:xx', 'Assistant:xx'],
    ],
  })
  history: Array<string>;
}

export class ChatGptDto {
  message: string;
  api_key: string;
  basePath: string;
  @ApiProperty({
    example: [
      ['Human:xx', 'Assistant:xx'],
      ['Human:xx', 'Assistant:xx'],
    ],
  })
  history: Array<string>;
}
export class SetEmbeddingDto {
  @ApiProperty({
    example: 'default/cohere/openai',
  })
  name: string;
  api_key?: string;
}

export class LlmChatMessage {
  @ApiProperty({ example: 'user', description: '消息角色' })
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ example: '你好', description: '消息内容' })
  content: string;
}

export class LlmChatDto {
  @ApiProperty({ example: 'lingmengcan', description: '模型名称' })
  model: string;

  @ApiProperty({ type: [LlmChatMessage], description: '消息列表' })
  messages: LlmChatMessage[];

  @ApiProperty({ example: 0.7, description: '温度参数', required: false })
  temperature?: number;

  @ApiProperty({ example: 1000, description: '最大token数', required: false })
  max_tokens?: number;

  @ApiProperty({ example: 1, description: 'top_p参数', required: false })
  top_p?: number;
}
