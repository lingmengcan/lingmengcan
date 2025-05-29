//对话
export interface Conversation {
  conversationId?: string;
  conversationName: string;
  userName?: string;
  status: number;
  llm: string;
  temperature: number;
  createdAt?: string;
  updatedAt?: string;
  messages?: Message[];

  //编辑状态
  isEdit?: boolean;
}

//消息
export interface Message {
  messageId?: string;
  previousId?: string;
  conversationId: string;
  fileId?: string;
  content?: string;
  reasoning?: string;
  status: number;
  sender: string;
  role: string;
  createdAt?: string;
  completed: number;
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
  temperature: number;
  llm: string;
}
