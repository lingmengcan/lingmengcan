import { ChatParams, Conversation, Message } from '@/models/chat';
import { Method } from '@/utils/http/axiosplus';
import http, { Result, httpStream } from '@/utils/http';

// 获取对话列表
export const getConversationList = () => http.request<Result<Conversation[]>>('chat/list', Method.POST);

// 新增对话
export const addConversation = (data: Conversation) =>
  http.request<Result<Conversation>>('chat/conversation/add', Method.POST, data);

// 更新对话
export const editConversation = (data: Conversation) =>
  http.request<Result<Conversation>>('chat/conversation/edit', Method.POST, data);

// 改变状态为删除
export const changeConversationStatus = (data: Conversation) =>
  http.request<Result<Conversation>>('chat/change-conversation-status', Method.POST, data);

// 清空列表
export const clearConversationList = () =>
  http.request<Result<Conversation>>('chat/clear-conversation-list', Method.POST);

// 获取对话消息列表
export const getConversationByConversationId = (conversationId: String) =>
  http.request<Result<Conversation>>('chat/conversation/' + conversationId, Method.GET);

// 新增消息
export const addMessage = (data: Message) => http.request<Result<Message>>('chat/message/add', Method.POST, data);

// 更新消息
export const editMessage = (data: Message) => http.request<Result<Message>>('chat/message/edit', Method.POST, data);

// 改变状态为删除
export const changeMessageStatus = (data: Message) =>
  http.request<Result<Message>>('chat/change-message-status', Method.POST, data);

// 清空对话的所有消息
export const deleteMessagesByConversationId = (data: String) =>
  http.request<Result<String>>('chat/clear-conversation-messages', Method.POST, data);

// 对话
// export const chat = (data: ChatParams) => http.request<any>('chat', Method.POST, data);

// 重新生成
export const regenerate = (data: ChatParams) => {
  return httpStream('/chat/regenerate', data);
};

// 流式对话
export async function chat(data: ChatParams) {
  return httpStream('/chat', data);
}

// LLM 调试对话 - 不存储到数据库
export async function debugChat(data: any) {
  return httpStream('/chat/debug', data);
}
