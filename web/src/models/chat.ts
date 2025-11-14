//对话
export interface Conversation {
  conversationId?: string;
  conversationName?: string;
  userName?: string;
  status?: number;
  llm?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: Message[];

  //编辑状态
  isEdit?: boolean;
}

//消息
export interface Message {
  messageId?: string;
  conversationId: string;
  content?: any; // AIMessageContent[] | UserMessageContent[] (JSON 数组格式)
  role: 'user' | 'assistant' | 'system';
  status: 'pending' | 'streaming' | 'complete' | 'stop' | 'error';
  createdAt?: string;
  updatedAt?: string;
}

//提示词
export interface Prompt {
  promptId?: string;
  title: string;
  content: string;
  status: number;
  userName: string;
  createdAt?: string;
}

export interface ChatParams {
  message: Message;
}
