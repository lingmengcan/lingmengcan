<template>
  <div class="relative flex h-full overflow-hidden bg-white p-5">
    <n-button v-if="!chatListVisable" class="w-10! h-10!" @click="emit('update:chatListVisable', !chatListVisable)">
      <template #icon>
        <ChatBubble1Icon />
      </template>
    </n-button>
    <div class="flex-1 flex justify-center max-w-[1080px] mx-auto">
      <t-chat
        ref="chatRef"
        :clear-history="false"
        animation="gradient"
        :text-loading="loading"
        :data="chatList"
        :is-stream-load="isStreamLoad"
      >
        <template #content="{ item, index }">
          <t-chat-reasoning v-if="item.reasoning?.length > 0" expand-icon-placement="right">
            <template #header>
              <t-chat-loading v-if="isStreamLoad && index === 0" :text="$t('views.chat.thinking')" />
              <div v-else style="display: flex; align-items: center">
                <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px" />
                <span>{{ $t('views.chat.thought') }}</span>
              </div>
            </template>
            <t-chat-content v-if="item.reasoning.length > 0" :content="item.reasoning" />
          </t-chat-reasoning>
          <t-chat-content v-if="item.content.length > 0" :content="item.content" />
        </template>
        <template #actions="{ item, index }">
          <t-chat-action
            :content="item.content"
            :operation-btn="index === 0 ? ['good', 'bad', 'replay', 'copy'] : ['good', 'bad', 'copy']"
            @operation="handleOperation"
          />
        </template>
        <template #footer>
          <t-chat-sender
            :stop-disabled="isStreamLoad"
            :textarea-props="{
              placeholder: $t('views.chat.inputPlaceholder'),
            }"
            @send="inputEnter"
            @file-select="fileSelect"
            @stop="onStop"
          >
            <template #header>
              <div class="m-1">
                <coversationParams v-model:modelValue="conversation" />
              </div>
            </template>
            <template #prefix>
              <div class="flex items-center gap-2">
                <n-tooltip trigger="hover" :show-arrow="false">
                  <template #trigger>
                    <selectModel v-model:model-name="conversation.llm" class="llm-select" model-type="GENERAL_LLM" />
                  </template>
                  <span>切换模型</span>
                </n-tooltip>
                <n-button :class="{ 'bg-blue-300! text-white!': isThinked }" @click="checkClick" class="rounded-lg!">
                  <template #icon><SystemSumIcon /></template>
                  <span>深度思考</span>
                </n-button>
              </div>
            </template>
          </t-chat-sender>
        </template>
      </t-chat>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, PropType, ref } from 'vue';
  import {
    Chat as TChat,
    ChatAction as TChatAction,
    ChatContent as TChatContent,
    ChatSender as TChatSender,
    ChatLoading as TChatLoading,
    ChatReasoning as TChatReasoning,
  } from '@tdesign-vue-next/chat';
  import { SystemSumIcon, CheckCircleIcon, ChatBubble1Icon } from 'tdesign-icons-vue-next';
  import { useRoute } from 'vue-router';
  import { useChatStore } from '@/store/modules/chat';
  import { useUserStore } from '@/store/modules/user';
  import defaultAvatar from '@/assets/images/avatar.jpg';
  import logo from '@/assets/images/logo.png';
  import { ChatParams, Conversation, Message } from '@/models/chat';
  import { chat, regenerate } from '@/api/chat/chat';
  import coversationParams from './coversation-params.vue';

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
  const isStreamLoad = ref(false);
  const isThinked = ref(true);
  const chatList = ref<ChatItem[]>([]);

  const chatRef = ref();

  const conversation = ref<Conversation>({
    llm: 'qwen3-30b-a3b',
    systemPrompt: '',
    temperature: 0.5,
    topP: 1,
    maxTokens: 7000,
  });

  interface ChatItem extends Message {
    avatar?: string;
    name?: string;
    datetime?: string;
  }

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
    isStreamLoad.value = false;
  };

  const handleOperation = function (type: string, item: ChatItem) {
    // 这里还不能用，等最新文档出来
    console.log('type', type, item);
    if (type === 'replay') {
      handleRegenerate(item);
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
    // 问题入库
    const newQuestion: ChatItem = {
      conversationId: conversationId.value,
      content: inputValue,
      reasoning: '',
      sender: userStore.username,
      role: 'user',
      status: 0,
      completed: 1,

      avatar: userStore.userInfo.avatar || defaultAvatar,
      datetime: new Date().toISOString(),
      name: userStore.username,
    };

    const question = await chatStore.addChatByConversationId(newQuestion);
    chatList.value.unshift(newQuestion);

    handleData(question!);
  }

  const handleData = async (question: Message) => {
    loading.value = true;
    isStreamLoad.value = true;

    // 空消息占位
    const answerEmpty: ChatItem = {
      avatar: logo,
      datetime: new Date().toISOString(),
      content: '',
      reasoning: '',
      name: 'lingmengcan',
      role: 'assistant',

      conversationId: conversationId.value,
      previousId: question?.messageId,
      sender: 'lingmengcan',
      status: 0,
      completed: 0,
    };

    chatList.value.unshift(answerEmpty);
    const answer = chatList.value[0];

    try {
      const chatParams: ChatParams = {
        message: question,
      };

      const isThinking = ref(false);
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
            if (isThinking.value) {
              answer.reasoning += result;
            } else {
              answer.content += result;
            }
          },
          complete(isOk, msg) {
            if (!isOk) {
              answer.role = 'error';
              answer.content = msg;
            }

            // 更新回答
            chatStore.addChatByConversationId({
              ...answer,
              completed: 1,
            });

            // 控制终止按钮
            isStreamLoad.value = false;
            loading.value = false;
          },
        },
      );
    } catch (e: any) {
      console.error('Chat error:', e.message);
    } finally {
      loading.value = false;
    }
  };

  async function handleRegenerate(answer: ChatItem) {
    try {
      loading.value = true;
      isStreamLoad.value = true;

      answer.content = '';
      answer.reasoning = '';

      const chatParams: ChatParams = {
        message: answer,
      };

      const isThinking = ref(false);
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
            if (isThinking.value) {
              answer.reasoning += result;
            } else {
              answer.content += result;
            }
          },
          complete(isOk, msg) {
            if (!isOk) {
              answer.role = 'error';
              answer.content = msg;
              answer.reasoning = msg;
            }
            // 更新回答
            chatStore.updateChatByConversationId(answer);

            // 控制终止按钮
            isStreamLoad.value = false;
            loading.value = false;
          },
        },
      );
    } catch (e: any) {
      console.error('Chat error:', e.message);
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
        chatList.value = conversation.value.messages.map((msg) => ({
          ...msg,
          avatar: msg.role === 'assistant' ? logo : userStore.userInfo.avatar || defaultAvatar,
          name: msg.sender,
          datetime: msg.createdAt,
        }));
      }
    }
  });
</script>
