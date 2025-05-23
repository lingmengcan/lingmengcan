<template>
  <div class="relative flex h-full overflow-hidden bg-white p-5">
    <div class="w-full flex justify-center max-w-[1080px] mx-auto">
      <t-chat
        ref="chatRef"
        :clear-history="false"
        :reverse="false"
        animation="moving"
        :text-loading="loading"
        :data="chatList"
        :is-stream-load="isStreamLoad"
        @scroll="handleChatScroll"
      >
        <template #content="{ item }">
          <t-chat-reasoning v-if="item.reasoning?.length > 0" expand-icon-placement="right">
            <template #header>
              <t-chat-loading v-if="isStreamLoad" text="思考中..." />
              <div v-else style="display: flex; align-items: center">
                <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px" />
                <span>已深度思考</span>
              </div>
            </template>
            <t-chat-content v-if="item.reasoning.length > 0" :content="item.reasoning" />
          </t-chat-reasoning>
          <t-chat-content v-if="item.content.length > 0" :content="item.content" />
        </template>
        <template #actions="{ item }">
          <t-chat-action :content="item.content" :operation-btn="['good', 'bad', 'replay', 'copy']" />
        </template>
        <template #footer>
          <t-chat-sender
            :stop-disabled="isStreamLoad"
            :textarea-props="{
              placeholder: '发消息、输入 @ 或 / 选择技能',
            }"
            @send="inputEnter"
            @stop="onStop"
          >
            <template #prefix>
              <div class="flex items-center gap-2">
                <n-tooltip trigger="hover" :show-arrow="false">
                  <template #trigger>
                    <selectModel v-model:model-name="selectedLlm" class="llm-select" model-type="GENERAL_LLM" />
                  </template>
                  <span>切换模型</span>
                </n-tooltip>
                <n-button :class="{ '!bg-blue-300 !text-white': isThinked }" @click="checkClick" class="!rounded-lg">
                  <template #icon><SystemSumIcon /></template>
                  <span>深度思考</span>
                </n-button>
              </div>
            </template>
          </t-chat-sender>
        </template>
      </t-chat>
      <n-button v-show="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
        <div class="to-bottom">
          <ArrowDownIcon />
        </div>
      </n-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue';
  import {
    Chat as TChat,
    ChatAction as TChatAction,
    ChatContent as TChatContent,
    ChatSender as TChatSender,
    ChatLoading as TChatLoading,
    ChatReasoning as TChatReasoning,
    TdChatItemProps,
  } from '@tdesign-vue-next/chat';
  import type { ModelRoleEnum, TdChatReasoning } from '@tdesign-vue-next/chat';
  import { SystemSumIcon, CheckCircleIcon, ArrowDownIcon } from 'tdesign-icons-vue-next';
  import { useRoute } from 'vue-router';
  import { useChatStore } from '@/store/modules/chat';
  import { useUserStore } from '@/store/modules/user';
  import defaultAvatar from '@/assets/images/avatar.jpg';
  import logo from '@/assets/images/logo.png';
  import { ChatParams, Message } from '@/models/chat';
  import { chat } from '@/api/chat/chat';

  const userStore = useUserStore();
  const route = useRoute();
  const chatStore = useChatStore();
  const conversationId = ref<string>((route.params as { conversationId: string }).conversationId);

  const conversation = computed(() => chatStore.conversation);

  const loading = ref(false);
  const isStreamLoad = ref(false);
  const isShowToBottom = ref(false);

  const chatRef = ref();
  const selectedLlm = ref('qwen3-30b-a3b');

  const isThinked = ref(true);

  // 倒序渲染
  const chatList = ref<TdChatItemProps[]>([]);

  // 滚动到底部
  const backBottom = () => {
    chatRef.value.scrollToBottom({
      behavior: 'smooth',
    });
  };

  const checkClick = () => {
    isThinked.value = !isThinked.value;
  };

  const onStop = function () {
    loading.value = false;
    isStreamLoad.value = false;
  };

  // 是否显示回到底部按钮
  const handleChatScroll = function ({ e }) {
    const scrollTop = e.target.scrollTop;
    isShowToBottom.value = scrollTop < 0;
  };

  // 模拟消息发送
  const inputEnter = async function (inputValue: string) {
    if (isStreamLoad.value) {
      return;
    }
    if (!inputValue) return;

    // 问题入库
    const newQuestion = {
      conversationId: conversationId.value,
      content: inputValue,
      reasoning: '',
      sender: userStore.username,
      role: 'user' as ModelRoleEnum,
      status: 0,
      completed: 1,
    };

    const question = await chatStore.addChatByConversationId(newQuestion);

    handleData(question);
  };
  const handleData = async (question: Message | undefined) => {
    // 空消息占位
    const answer = await chatStore.addChatByConversationId({
      conversationId: conversationId.value,
      previousId: question?.messageId,
      content: '',
      reasoning: '',
      sender: 'lingmengcan',
      role: 'assistant' as ModelRoleEnum,
      status: 0,
      completed: 0,
    });
    loading.value = true;
    isStreamLoad.value = true;

    try {
      const fetchChatApiOnce = async () => {
        const chatParams: ChatParams = {
          message: question!,
          temperature: 0.5,
          llm: selectedLlm.value,
        };
        const res = await chat(chatParams);

        if (answer && res) {
          let isThinking = false;
          let thinkContent = '';

          try {
            while (true) {
              const { done, value } = await res.read();
              if (done) break;

              const text = new TextDecoder().decode(value);

              // 检测思考过程的开始和结束
              if (text.includes('<think>')) {
                isThinking = true;
                continue;
              }

              if (text.includes('</think>')) {
                isThinking = false;
                answer.reasoning = thinkContent.trim();
                continue;
              }

              // 根据当前状态将内容添加到对应字段
              if (isThinking) {
                thinkContent += text;
              } else {
                answer.content += text;
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error);
          } finally {
            res?.releaseLock(); // 确保释放读取器
          }

          console.log('answer', answer);
          //当回答没有被终止时，更新回答
          if (answer.completed === 0) {
            answer.completed = 1;
            // 更新回答
            // chatList.value.unshift(answer);
            await chatStore.updateChatByConversationId(answer);
          }
        }

        loading.value = false;
        isStreamLoad.value = false;
      };

      await fetchChatApiOnce();
    } catch (e: any) {
      console.log(e);
    } finally {
      isStreamLoad.value = false;
      loading.value = false;
    }
  };

  // 将 conversation.messages 转换为 chatList 格式
  watchEffect(async () => {
    if (conversationId.value) {
      await chatStore.getChatByConversationId(conversationId.value);
      if (conversation.value?.messages) {
        chatList.value = conversation.value.messages.map((msg) => ({
          avatar: msg.role === 'assistant' ? logo : userStore.userInfo.avatar || defaultAvatar,
          name: msg.sender,
          datetime: msg.createdAt,
          content: msg.content,
          role: msg.role as ModelRoleEnum,
          reasoning: (msg.reasoning as TdChatReasoning) || false,
        }));
      }
      selectedLlm.value = chatStore.conversation?.llm as string;
    } else {
      chatStore.conversation = undefined;
    }
  });
</script>
