<script setup lang="ts">
  import { ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { copyToClip } from '@/utils';
  import Text from './text.vue';
  import Avatar from '@/components/avatar/index.vue';
  import { CopyOutline } from '@vicons/ionicons5';
  import { Message } from '@/models/chat';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  interface Props {
    item: Message;
    loading: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['regenerate']);

  const message = useMessage();

  const textRef = ref<HTMLElement>();

  const isAi = ref(props.item.sender === 'Assistant');

  const asRawText = ref(!isAi.value);

  const messageRef = ref<HTMLElement>();

  function handleRegenerate() {
    messageRef.value?.scrollIntoView();

    emit('regenerate', props.item);
  }

  async function handleCopy() {
    try {
      await copyToClip(props.item?.content || '');
      message.success(t('views.chat.copySuccess'));
    } catch {
      message.error(t('views.chat.copyFail'));
    }
  }
</script>

<template>
  <div ref="messageRef" class="message">
    <div class="relative flex w-full gap-2 px-3 py-3 m-auto text-base md:gap-3 lg:gap-6 lg:max-w-3xl lg:px-0">
      <div class="min-w-[32px] w-[32px] md:min-w-[40px] md:w-[40px]">
        <Avatar :is-ai="isAi" />
      </div>

      <div
        class="flex items-center relative rounded-xl rounded-tl-[3px] px-4 py-2"
        :class="[
          isAi ? 'w-full bg-gray-50 border border-gray-200 shadow-[0_1px_10px_rgba(8,26,81,0.05)]' : 'bg-[#D4E3FC]',
        ]"
      >
        <div class="flex flex-col w-full">
          <Text ref="textRef" :text="item?.content" :loading="loading" :as-raw-text="asRawText" />
          <div
            v-if="isAi && !loading"
            class="flex flex-row items-center justify-between py-2 pb-0 mt-2 border-t border-gray-200"
          >
            <div class="text-xs font-bold text-blue-500 cursor-pointer md:text-sm" @click="handleRegenerate">
              {{ $t('views.chat.message.regenerate') }}
            </div>
            <div class="h-5">
              <n-button :bordered="false" class="copy-button" @click="handleCopy">
                <template #icon>
                  <n-icon size="14">
                    <CopyOutline />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .copy-button {
    @apply w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 items-center;
  }
</style>
