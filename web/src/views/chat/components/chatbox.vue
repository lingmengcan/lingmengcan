<template>
  <div class="relative flex h-full overflow-hidden bg-white p-5">
    <t-button
      v-if="!chatListVisable"
      theme="default"
      variant="outline"
      shape="square"
      @click="emit('update:chatListVisable', !chatListVisable)"
    >
      <template #icon>
        <t-icon name="chat-bubble" />
      </template>
    </t-button>
    <div class="flex-1 flex justify-center max-w-[1080px] mx-auto">
      <t-chat ref="chatRef" style="width: 100%">
        <t-chat-message
          v-for="(message, idx) in chatList"
          :key="message.messageId"
          v-bind="messageProps[message.role]"
          :role="message.role"
          :content="formatMessageContent(message)"
          :status="message.status"
        >
          <template #actionbar>
            <t-chat-actionbar
              v-if="message.role === 'assistant' && message.status === 'complete'"
              :action-bar="getChatActionBar(idx === chatList.length - 1)"
              @actions="handleActions"
            />
          </template>
        </t-chat-message>
      </t-chat>
      <t-chat-sender
        :loading="loading"
        :textarea-props="{
          placeholder: $t('views.chat.inputPlaceholder'),
        }"
        @send="inputEnter"
        @file-select="fileSelect"
        @stop="onStop"
      >
        <template #input-prefix>
          <coversationParams v-model:modelValue="conversation" />
        </template>
        <template #footer-prefix>
          <div class="flex items-center gap-2">
            <t-tooltip content="切换模型">
              <selectModel
                v-model:model-name="conversation.llm"
                class="llm-select rounded-full"
                model-type="GENERAL_LLM"
              />
            </t-tooltip>
            <t-button :theme="isThinked ? 'primary' : 'default'" variant="outline" shape="round" @click="checkClick">
              <template #icon>
                <t-icon name="system-sum" />
              </template>
              深度思考
            </t-button>
          </div>
        </template>
      </t-chat-sender>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, PropType, ref } from 'vue';
  import {
    Chat as TChat,
    ChatActionbar as TChatActionbar,
    ChatMessage as TChatMessage,
    ChatSender as TChatSender,
    TdChatMessageConfig,
    TdChatActionsName,
  } from '@tdesign-vue-next/chat';
  import { Button as TButton, Tooltip as TTooltip } from 'tdesign-vue-next';
  import { useRoute } from 'vue-router';
  import { useChatStore } from '@/store/modules/chat';
  import { useUserStore } from '@/store/modules/user';
  import defaultAvatar from '@/assets/images/avatar.jpg';
  import logo from '@/assets/images/logo.png';
  import { ChatParams, Conversation, Message } from '@/models/chat';
  import { chat, regenerate } from '@/api/chat/chat';
  import coversationParams from './coversation-params.vue';
  import selectModel from '@/components/select/select-model.vue';

  defineProps({
    chatListVisable: {
      type: [Boolean] as PropType<boolean>,
      default: true,
    },
  });

  const emit = defineEmits(['update:chatListVisable']);

  const userStore = useUserStore();
  const route = useRoute();
  const chatStore = useChatStore();
  const conversationId = ref<string>((route.params as { conversationId: string }).conversationId);

  const loading = ref(false);
  const isThinked = ref(true);
  const chatList = ref<ChatItem[]>([]);

  const chatRef = ref();

  const conversation = ref<Conversation>({
    llm: 'qwen3-30b-a3b',
    systemPrompt: '',
    temperature: 0.5,
    topP: 1,
    maxTokens: 4096,
  });

  interface ChatItem extends Message {
    avatar?: string;
    name?: string;
    datetime?: string;
    reasoning?: string; // 用于前端显示的思考内容（从 content 中提取）
  }

  // 消息属性配置
  const messageProps: TdChatMessageConfig = {
    user: {
      variant: 'base',
      placement: 'right',
    },
    assistant: {
      placement: 'left',
      chatContentProps: {
        thinking: {
          maxHeight: 100,
        },
      },
    },
  };

  // 获取聊天操作栏配置
  const getChatActionBar = (isLast: boolean): TdChatActionsName[] => {
    let filterActions: TdChatActionsName[] = ['replay', 'good', 'bad', 'copy'];
    if (!isLast) {
      filterActions = filterActions.filter((item) => item !== 'replay') as TdChatActionsName[];
    }
    return filterActions;
  };

  // 格式化消息内容为数组格式（TDesign ChatMessage 要求 content 为数组）
  const formatMessageContent = (message: ChatItem): any[] => {
    if (!message.content) return [];
    // 如果 content 已经是数组，直接返回
    if (Array.isArray(message.content)) {
      return message.content;
    }
    // 如果是字符串（兼容旧数据），转换为 text 类型的内容数组
    if (typeof message.content === 'string') {
      return [{ type: 'text', data: message.content }];
    }
    return [];
  };

  // 思考按钮
  const checkClick = () => {
    isThinked.value = !isThinked.value;
  };

  const fileSelect = (params: {
    files: File[]; // File 数组类型
  }) => {
    const { files } = params;
    console.log('files', files);
  };

  const onStop = function () {
    loading.value = false;
  };

  const handleActions = function (type: string, options) {
    // 这里还不能用，等最新文档出来
    console.log('type', type, options);
    if (type === 'replay') {
      // 需要从当前聊天列表中获取对应的消息
      const currentMessage = chatList.value.find((msg) => msg.role === 'assistant');
      if (currentMessage) {
        handleRegenerate(currentMessage);
      }
    }
  };

  // 发送
  const inputEnter = async function (inputValue: string) {
    if (loading.value) return;
    if (!inputValue) return;

    if (conversationId.value) {
      await chatStore.updateConversation(conversation.value);
      onConversation(inputValue);
    } else {
      conversation.value.conversationName = inputValue.substring(0, 20);
      await chatStore.addConversation(conversation.value).then(() => {
        conversationId.value = chatStore.activeId!;
        onConversation(inputValue);
      });
    }
  };

  //对话
  async function onConversation(inputValue: string) {
    // 问题入库 - 将文本转换为 JSON 数组格式
    const newQuestion: ChatItem = {
      conversationId: conversationId.value,
      content: [{ type: 'text', data: inputValue }], // 转换为 TDesign ChatMessage 格式
      role: 'user',
      status: 'pending',
      avatar: userStore.userInfo.avatar || defaultAvatar,
      datetime: new Date().toISOString(),
      name: userStore.username,
    };

    // 转换为 Message 类型保存到数据库
    const questionMessage: Message = {
      messageId: undefined,
      conversationId: newQuestion.conversationId,
      content: newQuestion.content,
      role: newQuestion.role,
      status: newQuestion.status,
    };
    const question = await chatStore.addChatByConversationId(questionMessage);
    chatList.value.unshift(newQuestion);

    handleData(question!);
  }

  const handleData = async (question: Message) => {
    loading.value = true;

    // 空消息占位 - 使用 JSON 数组格式
    const answerEmpty: ChatItem = {
      avatar: logo,
      datetime: new Date().toISOString(),
      content: [], // 初始化为空数组
      reasoning: '', // 用于前端显示的思考内容
      name: 'lingmengcan',
      role: 'assistant',
      conversationId: conversationId.value,
      status: 'streaming', // 流式传输中
    };

    chatList.value.unshift(answerEmpty);
    const answer = chatList.value[0];

    try {
      const chatParams: ChatParams = {
        message: question,
      };

      const isThinking = ref(false);
      let textContent = ''; // 累积文本内容
      let reasoningContent = ''; // 累积思考内容

      await fetchSSE(
        () => {
          return chat(chatParams);
        },
        {
          success(result) {
            loading.value = false;
            // 处理思考标记
            if (result.includes('<think>')) {
              isThinking.value = true;
              result = result.replace('<think>', '');
            }
            if (result.includes('</think>')) {
              isThinking.value = false;
              result = result.replace('</think>', '');
            }

            // 更新对应字段
            if (!answer.content || !Array.isArray(answer.content)) {
              answer.content = [];
            }

            if (isThinking.value) {
              reasoningContent += result;
              // 将思考内容存储为 reasoning 类型的内容块
              const reasoningIndex = answer.content.findIndex((item: any) => item?.type === 'reasoning');
              if (reasoningIndex >= 0) {
                // 更新现有的 reasoning 内容
                if (!answer.content[reasoningIndex].data) {
                  answer.content[reasoningIndex].data = [];
                }
                const lastTextIndex = answer.content[reasoningIndex].data.findLastIndex(
                  (item: any) => item?.type === 'text',
                );
                if (lastTextIndex >= 0) {
                  answer.content[reasoningIndex].data[lastTextIndex] = { type: 'text', data: reasoningContent };
                } else {
                  answer.content[reasoningIndex].data.push({ type: 'text', data: reasoningContent });
                }
              } else {
                // 创建新的 reasoning 内容块
                answer.content.push({
                  type: 'reasoning',
                  data: [{ type: 'text', data: reasoningContent }],
                });
              }
              // 同时保存到 reasoning 字段用于前端显示
              answer.reasoning = reasoningContent;
            } else {
              textContent += result;
              // 更新 content 数组，保持最后一个 text 类型的内容块
              const lastTextIndex = answer.content.findLastIndex((item: any) => item?.type === 'text');
              if (lastTextIndex >= 0) {
                answer.content[lastTextIndex] = { type: 'text', data: textContent };
              } else {
                answer.content.push({ type: 'text', data: textContent });
              }
            }
          },
          complete(isOk, msg) {
            if (!isOk) {
              answer.status = 'error';
              if (!answer.content || !Array.isArray(answer.content)) {
                answer.content = [];
              }
              answer.content.push({ type: 'text', data: msg });
            } else {
              answer.status = 'complete';
            }

            // 更新回答到数据库
            const answerMessage: Message = {
              messageId: answer.messageId,
              conversationId: answer.conversationId,
              content: answer.content,
              role: answer.role,
              status: answer.status,
            };
            chatStore.addChatByConversationId(answerMessage);

            // 控制终止按钮
            loading.value = false;
          },
        },
      );
    } catch (e: any) {
      console.error('Chat error:', e.message);
      answer.status = 'error';
      if (!answer.content || !Array.isArray(answer.content)) {
        answer.content = [];
      }
      answer.content.push({ type: 'text', data: e.message });
    } finally {
      loading.value = false;
    }
  };

  async function handleRegenerate(answer: ChatItem) {
    try {
      loading.value = true;

      // 重置内容
      answer.content = [];
      answer.reasoning = '';
      answer.status = 'streaming';

      // 转换为 Message 类型
      const answerMessage: Message = {
        messageId: answer.messageId,
        conversationId: answer.conversationId,
        content: answer.content,
        role: answer.role,
        status: answer.status,
      };

      const chatParams: ChatParams = {
        message: answerMessage,
      };

      const isThinking = ref(false);
      let textContent = ''; // 累积文本内容
      let reasoningContent = ''; // 累积思考内容

      await fetchSSE(
        () => {
          return regenerate(chatParams);
        },
        {
          success(result) {
            loading.value = false;
            // 处理思考标记
            if (result.includes('<think>')) {
              isThinking.value = true;
              result = result.replace('<think>', '');
            }
            if (result.includes('</think>')) {
              isThinking.value = false;
              result = result.replace('</think>', '');
            }

            // 更新对应字段
            if (!answer.content || !Array.isArray(answer.content)) {
              answer.content = [];
            }

            if (isThinking.value) {
              reasoningContent += result;
              // 将思考内容存储为 reasoning 类型的内容块
              const reasoningIndex = answer.content.findIndex((item: any) => item?.type === 'reasoning');
              if (reasoningIndex >= 0) {
                if (!answer.content[reasoningIndex].data) {
                  answer.content[reasoningIndex].data = [];
                }
                const lastTextIndex = answer.content[reasoningIndex].data.findLastIndex(
                  (item: any) => item?.type === 'text',
                );
                if (lastTextIndex >= 0) {
                  answer.content[reasoningIndex].data[lastTextIndex] = { type: 'text', data: reasoningContent };
                } else {
                  answer.content[reasoningIndex].data.push({ type: 'text', data: reasoningContent });
                }
              } else {
                answer.content.push({
                  type: 'reasoning',
                  data: [{ type: 'text', data: reasoningContent }],
                });
              }
              answer.reasoning = reasoningContent;
            } else {
              textContent += result;
              // 更新 content 数组
              const lastTextIndex = answer.content.findLastIndex((item: any) => item?.type === 'text');
              if (lastTextIndex >= 0) {
                answer.content[lastTextIndex] = { type: 'text', data: textContent };
              } else {
                answer.content.push({ type: 'text', data: textContent });
              }
            }
          },
          complete(isOk, msg) {
            if (!isOk) {
              answer.status = 'error';
              if (!answer.content || !Array.isArray(answer.content)) {
                answer.content = [];
              }
              answer.content.push({ type: 'text', data: msg });
              answer.reasoning = msg;
            } else {
              answer.status = 'complete';
            }
            // 更新回答
            const answerMessage: Message = {
              messageId: answer.messageId,
              conversationId: answer.conversationId,
              content: answer.content,
              role: answer.role,
              status: answer.status,
            };
            chatStore.updateChatByConversationId(answerMessage);

            // 控制终止按钮
            loading.value = false;
          },
        },
      );
    } catch (e: any) {
      console.error('Chat error:', e.message);
      answer.status = 'error';
      if (!answer.content || !Array.isArray(answer.content)) {
        answer.content = [];
      }
      answer.content.push({ type: 'text', data: e.message });
    } finally {
      loading.value = false;
    }
  }

  // 流处理
  const fetchSSE = async (
    fetchFn: () => Promise<Response>,
    options: { success: (chunk: string) => void; fail?: () => void; complete?: (isOk: boolean, msg?: string) => void },
  ) => {
    const response = await fetchFn();
    const { success, fail, complete } = options;
    // 如果不 ok 说明有请求错误
    if (!response.ok) {
      complete?.(false, response.statusText);
      fail?.();
      return;
    }
    const reader = response?.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    reader.read().then(function processText({ done, value }) {
      if (done) {
        // 正常的返回
        complete?.(true);
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      success(chunk);
      reader.read().then(processText);
    });
  };

  onMounted(async () => {
    if (conversationId.value) {
      chatStore.activeId = conversationId.value;
      const res = await chatStore.getChatByConversationId(conversationId.value);
      if (res) {
        conversation.value = res;
      }

      // 将 conversation.messages 转换为 chatList 格式
      if (conversation.value.messages) {
        chatList.value = conversation.value.messages.map((msg) => {
          // 从 content 数组中提取 reasoning（如果有）
          let reasoning = '';
          if (Array.isArray(msg.content)) {
            const reasoningContent = msg.content.find((item: any) => item?.type === 'reasoning');
            if (reasoningContent?.data) {
              reasoning = Array.isArray(reasoningContent.data)
                ? reasoningContent.data.map((item: any) => item?.data || '').join('\n')
                : '';
            }
          }

          return {
            ...msg,
            status: msg.status || 'pending',
            avatar: msg.role === 'assistant' ? logo : userStore.userInfo.avatar || defaultAvatar,
            name: msg.role === 'assistant' ? 'lingmengcan' : userStore.username,
            datetime: msg.createdAt,
            reasoning, // 提取的思考内容
          };
        });
      }
    }
  });
</script>
