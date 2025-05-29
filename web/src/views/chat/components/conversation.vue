<script lang="ts" setup>
  import { PropType, Ref, watchEffect, computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useChatStore } from '@/store/modules/chat';
  import { useScroll } from '../hooks/useScroll';
  import { ChatParams, Message, Prompt } from '@/models/chat';
  import { chat, regenerate } from '@/api/chat/chat';
  import {
    ChatbubblesOutline,
    SettingsOutline,
    GridOutline,
    PaperPlaneOutline,
    StopCircleOutline,
  } from '@vicons/ionicons5';
  import MessageComponent from './message.vue';
  import PromptComponent from './prompt.vue';
  import { PopoverInst, UploadFileInfo } from 'naive-ui';
  import { usePromptStore } from '@/store/modules/prompt';
  import storage from '@/utils/storage';
  import { ACCESS_TOKEN } from '@/constants';
  import selectModel from '@/components/select/select-model.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  defineProps({
    chatListVisable: {
      type: [Boolean] as PropType<boolean>,
      default: true,
    },
  });

  const emit = defineEmits(['update:chatListVisable']);

  const token = storage.get(ACCESS_TOKEN, '');

  const temperature = ref(0.5);
  const popoverParamRef = ref<PopoverInst | null>(null);
  const popoverPromptRef = ref<PopoverInst | null>(null);

  const inputRef = ref<Ref | null>(null);
  const route = useRoute();
  const chatStore = useChatStore();
  const promptStore = usePromptStore();

  const conversationId = ref<string>((route.params as { conversationId: string }).conversationId);

  const conversation = computed(() => chatStore.conversation);

  const prompt = ref<string>('');
  const loading = ref<boolean>(false);
  const answer = ref<Message>();

  const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll();

  const selectedLlm = ref('DeepSeek-V3');

  function handleStop() {
    if (loading.value) {
      // 更新回答
      if (answer.value) {
        answer.value.content = t('views.chat.PausedGeneration');
        answer.value.completed = 1;
        chatStore.updateChatByConversationId(answer.value);
      }

      loading.value = false;
    }
  }

  function handleEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    if (loading.value) return;

    if (conversationId.value) {
      onConversation(prompt.value);
    } else {
      chatStore.addConversation(temperature.value, selectedLlm.value).then(() => {
        conversationId.value = chatStore.activeId!;
        onConversation(prompt.value);
      });
    }
  }

  async function onConversation(message: string, fileId: string = '') {
    if (!message || message.trim() === '') return;

    // 问题入库
    const newChat: Message = {
      conversationId: conversationId.value,
      content: message,
      sender: 'Human',
      role: 'user',
      fileId,
      status: 0,
      completed: 1,
    };

    const question = await chatStore.addChatByConversationId(newChat);

    if (fileId && question) {
      question.content = t('views.chat.documentSummary');
    }

    // 创建回答
    answer.value = await chatStore.addChatByConversationId({
      conversationId: conversationId.value,
      previousId: question?.messageId,
      content: '',
      fileId,
      sender: 'assistant',
      status: 0,
      completed: 0,
    });

    // 等待回答
    loading.value = true;
    prompt.value = '';

    scrollToBottom();

    try {
      const fetchChatApiOnce = async () => {
        const chatParams: ChatParams = {
          message: question!,
          temperature: temperature.value,
          llm: selectedLlm.value,
        };
        // const res = await chat(chatParams);
        const res = await chat(chatParams);

        if (answer.value && res) {
          try {
            while (true) {
              const { done, value } = await res.read();
              if (done) break;
              answer.value.content += new TextDecoder().decode(value);

              scrollToBottom();
            }
          } catch (error) {
            console.error('Error reading stream:', error);
          } finally {
            res?.releaseLock(); // 确保释放读取器
          }

          //当回答没有被终止时，更新回答
          if (answer.value.completed === 0) {
            answer.value.completed = 1;
            // 更新回答
            await chatStore.updateChatByConversationId(answer.value);
          }
        }

        scrollToBottom();
        loading.value = false;
      };

      await fetchChatApiOnce();
    } catch (error: any) {
      scrollToBottomIfAtBottom();
    } finally {
      loading.value = false;
    }
  }

  function onSelectPrompt(item: Prompt) {
    prompt.value = item.content;
    popoverPromptRef.value?.setShow(false);
  }

  async function onRegenerate(answer: Message) {
    // 等待回答
    try {
      answer.content = '';
      answer.completed = 0;

      const fetchChatApiOnce = async () => {
        const regenerateParams: ChatParams = {
          message: answer,
          temperature: temperature.value,
          llm: selectedLlm.value,
        };
        const res = await regenerate(regenerateParams);

        if (res) {
          try {
            while (true) {
              const { done, value } = await res.read();
              if (done) break;
              answer.content += new TextDecoder().decode(value);

              scrollToBottom();
            }
          } catch (error) {
            console.error('Error reading stream:', error);
          } finally {
            res?.releaseLock(); // 确保释放读取器
          }

          answer.completed = 1;
          // 更新回答
          await chatStore.updateChatByConversationId(answer);
        }
      };

      await fetchChatApiOnce();
    } catch (error: any) {
    } finally {
    }
  }

  function handleSetting() {
    popoverParamRef.value?.setShow(false);
  }

  function afterUploaded({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) {
    // 定义允许的文件类型数组
    // messageUi.success((event?.target as XMLHttpRequest).response);
    const res = JSON.parse((event?.target as XMLHttpRequest).response);
    if (res?.code === 0) {
      const fileId = res.data;
      const message = file.name;
      onConversation(message, fileId);
    }
  }

  // 自动拉出提示词
  const promptOptions = computed(() => {
    if (prompt.value.startsWith('/')) {
      let promptList = promptStore.promptList;
      if (promptList.length === 0) {
        promptStore.getPromptList();
      }

      return promptList
        .filter((item: Prompt) => item.content.toLowerCase().includes(prompt.value.substring(1).toLowerCase()))
        .map((prompt: Prompt) => {
          return {
            label: prompt.content,
            value: prompt.content,
          };
        });
    } else {
      return [];
    }
  });

  watchEffect(async () => {
    if (conversationId.value) {
      await chatStore.getChatByConversationId(conversationId.value);
      selectedLlm.value = chatStore.conversation?.llm as string;
      temperature.value = chatStore.conversation?.temperature ?? 0.5;
    } else {
      chatStore.conversation = undefined;
    }
  });

  onMounted(async () => {
    chatStore.activeId = conversationId.value;

    scrollToBottom();

    if (inputRef.value) inputRef.value?.focus();
  });
</script>

<template>
  <div class="relative flex h-full overflow-hidden bg-white">
    <div
      class="absolute z-10 flex justify-between w-full lg:py-4 lg:px-6 bg-gradient-to-t from-transparent via-white/50 to-white"
    >
      <div class="flex gap-3">
        <n-button
          v-if="!chatListVisable"
          class="action-button"
          @click="emit('update:chatListVisable', !chatListVisable)"
        >
          <template #icon>
            <n-icon>
              <ChatbubblesOutline />
            </n-icon>
          </template>
        </n-button>

        <div class="relative z-0 w-52 h-[40px] mr-9 bg-gray-200 rounded-sm text-neutral-800 text-sm flex items-center">
          <selectModel v-model:model-name="selectedLlm" class="llm-select" model-type="GENERAL_LLM" />
          <n-popover ref="popoverParamRef" trigger="click" placement="bottom-end" width="400">
            <template #trigger>
              <n-button :bordered="false" class="action-button action-button-border-l">
                <template #icon>
                  <n-icon size="18">
                    <SettingsOutline />
                  </n-icon>
                </template>
              </n-button>
            </template>
            <div>
              <div class="w-full px-4 py-2 text-base font-bold border-b">{{ $t('views.chat.paramsetting') }}</div>
              <div class="flex flex-col w-full gap-6 p-4">
                <div class="flex flex-col">
                  <label class="mb-2 font-bold text-left text-neutral-700">{{ $t('views.chat.temperature') }}</label>
                  <span class="text-xs text-black/50">
                    {{ $t('views.chat.temperatureTips') }}
                  </span>
                  <span class="mt-2 mb-1 font-sans text-center text-neutral-900">
                    {{ temperature }}
                  </span>
                  <n-slider v-model:value="temperature" :step="0.1" :min="0" :max="1" />
                  <ul class="w mt-2 pb-8 flex justify-between px-[12px] text-neutral-500 text-xs">
                    <li class="flex justify-center">
                      <span class="absolute">{{ $t('views.chat.temperatureLevel1') }}</span>
                    </li>
                    <li class="flex justify-center">
                      <span class="absolute">{{ $t('views.chat.temperatureLevel2') }}</span>
                    </li>
                    <li class="flex justify-center">
                      <span class="absolute">{{ $t('views.chat.temperatureLevel3') }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="w-full px-4 pb-4">
                <n-button class="setting-button" @click="handleSetting">
                  {{ $t('common.ok') }}
                </n-button>
              </div>
            </div>
          </n-popover>
        </div>
      </div>
      <div class="relative flex">
        <n-popover ref="popoverPromptRef" trigger="click" placement="bottom-end" width="400">
          <template #trigger>
            <n-button class="action-button">
              <template #icon>
                <n-icon size="18">
                  <GridOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          <PromptComponent @select-prompt="onSelectPrompt" />
        </n-popover>
      </div>
    </div>
    <div class="flex flex-col justify-center flex-auto overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-screen p-1 overflow-x-hidden">
        <template v-if="!conversation?.messages?.length">
          <div class="flex flex-col justify-center h-full items-center mx-auto space-y-4 max-w-[600px]">
            <div class="text-4xl font-semibold text-center text-gray-800">{{ $t('views.chat.hiContent1') }}</div>
            <div class="text-base text-center text-gray-500">
              {{ $t('views.chat.hiContent2') }}
            </div>
          </div>
        </template>
        <template v-else>
          <MessageComponent
            v-for="(item, index) of conversation?.messages"
            :key="index"
            :item="item.messageId === answer?.messageId ? (answer as Message) : item"
            :loading="item.completed === 0"
            @regenerate="onRegenerate"
          />
          <div class="sticky bottom-0 left-0 flex justify-center">
            <n-button v-if="loading" type="warning" @click="handleStop">
              <template #icon>
                <StopCircleOutline />
              </template>
              {{ $t('views.chat.stopGeneration') }}
            </n-button>
          </div>
        </template>
      </div>
      <div class="w-full pb-2 border-transparent bg-gradient-to-b from-transparent via-white/50 to-white">
        <div class="gap-3 mx-2 mt-6 stretch last:mb-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-3xl">
          <div class="mb-1">
            <n-upload
              action="/api/file/upload"
              accept=".txt,.pdf,.doc,.docx"
              :show-file-list="false"
              :with-credentials="true"
              :headers="{ Authorization: `Bearer ${token}` }"
              :data="{ conversationId, llm: selectedLlm }"
              @finish="afterUploaded"
            >
              <n-button>{{ $t('common.upload') }}</n-button>
            </n-upload>
          </div>

          <n-auto-complete v-model:value="prompt" :options="promptOptions">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <n-input
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                rows="1"
                autosize
                round
                class="max-h-72 py-2 h-[52px] resize-none"
                :placeholder="$t('views.chat.inputPlaceholder')"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              >
                <template #suffix>
                  <n-button :bordered="false" :loading="loading" style="width: 20px" @click="handleSubmit">
                    <template #icon>
                      <n-icon size="16">
                        <PaperPlaneOutline />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </n-input>
            </template>
          </n-auto-complete>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .llm-select {
    :deep(.n-base-selection-label) {
      @apply ml-1 border-none bg-transparent;
    }
  }

  .action-button {
    @apply bg-gray-200 w-10 h-10 hover:opacity-70 rounded-none;

    &-border-l {
      @apply border-l border-blue-400;
    }
  }

  .setting-button {
    @apply w-full px-4 py-2 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none;
  }
</style>
