import {
  addConversation,
  addMessage,
  changeConversationStatus,
  changeMessageStatus,
  clearConversationList,
  deleteMessagesByConversationId,
  editConversation,
  editMessage,
  getConversationByConversationId,
  getConversationList,
} from '@/api/chat/chat';
import { Message, Conversation } from '@/models/chat';
import router from '@/router';
import { defineStore } from 'pinia';

export interface ChatState {
  activeId: string | undefined;
  conversation: Conversation | undefined;
  conversationList: Conversation[];
}

export const useChatStore = defineStore('chat-store', {
  state: (): ChatState => ({
    activeId: '',
    conversation: undefined,
    conversationList: [],
  }),

  actions: {
    async setConversationList() {
      const res = await getConversationList();

      if (res?.code === 0) {
        this.conversationList = res.data;
      }
    },

    async addConversation(conversation: Conversation) {
      const res = await addConversation(conversation);

      if (res?.code === 0) {
        this.conversationList.unshift(res.data);
        this.activeId = res.data.conversationId;
      }
    },

    async updateConversation(conversation: Conversation) {
      const res = await editConversation(conversation);

      if (res?.code === 0) {
        this.setConversationList();
      }
    },

    async deleteConversation(conversation: Conversation) {
      try {
        conversation.status = 1;
        const res = await changeConversationStatus(conversation);

        if (res?.code === 0) {
          await this.reloadRoute();
        }
      } catch (error) {
        console.error('删除对话失败:', error);
        const message = window['$message'];
        if (message) {
          message.error('删除对话失败，请稍后重试');
        }
      }
    },

    async clearConversationList() {
      const res = await clearConversationList();

      if (res?.code === 0) {
        await this.reloadRoute();
      }
    },

    async setActive(conversationId?: string) {
      if (this.activeId !== conversationId) {
        this.activeId = conversationId;
        await this.reloadRoute(conversationId);
      }
    },

    async getChatByConversationId(conversationId: string) {
      const res = await getConversationByConversationId(conversationId);

      if (res?.code === 0) {
        this.conversation = res.data;
      }

      return this.conversation;
    },

    async addChatByConversationId(message: Message) {
      const res = await addMessage(message);

      if (res?.code === 0) {
        // 更新messages
        await this.getChatByConversationId(message.conversationId);
        return res.data;
      }
    },

    async updateChatByConversationId(message: Message) {
      const res = await editMessage(message);

      if (res?.code === 0) {
        // 更新messages
        this.getChatByConversationId(message.conversationId);
      }
    },

    async deleteChat(message: Message) {
      const res = await changeMessageStatus(message);

      if (res?.code === 0) {
        // 更新messages
        this.getChatByConversationId(message.conversationId);
      }
    },

    async clearChatByConversationId(conversationId: string) {
      const res = await deleteMessagesByConversationId(conversationId);

      if (res?.code === 0) {
        // 更新messages
        this.getChatByConversationId(conversationId);
      }
    },

    async reloadRoute(conversationId?: string | undefined) {
      await router.push({ name: 'chat', params: { conversationId } });
    },
  },
});
