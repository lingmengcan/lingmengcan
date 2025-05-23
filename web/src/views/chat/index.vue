<script setup lang="ts">
  import { ChatbubblesOutline, AddCircleOutline, TrashOutline } from '@vicons/ionicons5';
  import { MenuFoldOutlined } from '@vicons/antd';
  import { ref } from 'vue';
  import { useChatStore } from '@/store/modules/chat';
  import List from './components/list.vue';
  import Chatbox from './components/chatbox.vue';
  import { useDialog, useMessage } from 'naive-ui';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const message = useMessage();
  const dialog = useDialog();
  const chatStore = useChatStore();
  const chatListVisable = ref(true);

  function handleAdd() {
    chatStore.addConversation();
  }

  function handleClear() {
    dialog.warning({
      title: t('common.alert'),
      content: t('views.chat.clearMessage'),
      positiveText: t('common.confirm'),
      negativeText: t('common.cancel'),
      onPositiveClick: () => {
        chatStore.clearConversationList().then(() => {
          message.success(t('views.chat.clearSuccess'));
        });
      },
    });
  }
</script>
<template>
  <div class="flex w-full h-full overflow-hidden rounded-md">
    <div>
      <div v-if="chatListVisable" class="relative flex h-full w-[260px] flex-col p-4 transition-all bg-[#ffffff99]">
        <div class="flex flex-row justify-between h-10">
          <div class="flex items-center text-gray-500">
            <n-icon size="22" class="mx-2">
              <ChatbubblesOutline />
            </n-icon>
            <div>{{ $t('views.chat.list') }}</div>
          </div>
          <n-button class="action-button" @click="chatListVisable = !chatListVisable">
            <template #icon>
              <n-icon>
                <MenuFoldOutlined />
              </n-icon>
            </template>
          </n-button>
        </div>
        <div class="mt-4">
          <n-button dashed class="new-chat-button" @click="handleAdd">
            <template #icon>
              <n-icon>
                <AddCircleOutline />
              </n-icon>
            </template>
            {{ $t('views.chat.new') }}
          </n-button>
        </div>

        <List />

        <div class="flex-col">
          <n-button :bordered="false" class="gap-3 hover:bg-gray-500/10" @click="handleClear">
            <template #icon>
              <n-icon size="14">
                <TrashOutline />
              </n-icon>
            </template>
            {{ $t('views.chat.clearList') }}
          </n-button>
        </div>
      </div>
    </div>
    <div class="flex-1"><Chatbox /></div>
    <!-- <div class="flex-1"><Conversation v-model:chat-list-visable="chatListVisable" /></div> -->
  </div>
</template>

<style scoped>
  .action-button {
    @apply w-10 h-10 bg-gray-200 hover:bg-slate-200 rounded;
  }

  .new-chat-button {
    @apply w-full h-10 bg-white;
  }
</style>
