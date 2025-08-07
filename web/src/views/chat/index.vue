<script setup lang="ts">
  import { ref } from 'vue';
  import { useChatStore } from '@/store/modules/chat';
  import { Conversation } from '@/models/chat';
  import List from './components/list.vue';
  import Chatbox from './components/chatbox.vue';
  import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const chatStore = useChatStore();
  const chatListVisable = ref(true);

  async function handleAdd() {
    const newConversation: Conversation = {
      conversationName: t('views.chat.new'),
      llm: 'qwen3-30b-a3b',
      systemPrompt: '',
      temperature: 0.5,
      topP: 1,
      maxTokens: 7000,
    };

    await chatStore.addConversation(newConversation);
    // addConversation 方法会自动设置 activeId，所以直接使用更新后的 activeId
    await chatStore.reloadRoute(chatStore.activeId);
  }

  function handleClear() {
    DialogPlugin.confirm({
      header: t('common.alert'),
      body: t('views.chat.clearMessage'),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: () => {
        chatStore.clearConversationList().then(() => {
          MessagePlugin.success(t('views.chat.clearSuccess'));
        });
      },
    });
  }
</script>
<template>
  <div class="flex w-full h-full rounded-md">
    <div>
      <div v-if="chatListVisable" class="relative flex h-full w-[260px] flex-col p-4 transition-all bg-[#ffffff99]">
        <div class="flex flex-row justify-between h-10">
          <div class="flex items-center text-gray-500">
            <t-icon name="chat-bubble" size="22" class="mx-2" />
            <div>{{ $t('views.chat.list') }}</div>
          </div>
          <t-button variant="outline" shape="square" class="w-10! h-10!" @click="chatListVisable = !chatListVisable">
            <template #icon>
              <t-icon name="menu-unfold" />
            </template>
          </t-button>
        </div>
        <div class="mt-4">
          <t-button variant="dashed" class="w-full! h-10! bg-white!" @click="handleAdd">
            <template #icon>
              <t-icon name="add-circle" />
            </template>
            {{ $t('views.chat.new') }}
          </t-button>
        </div>

        <div class="flex-1 overflow-hidden">
          <List />
        </div>

        <div class="flex-col mt-auto">
          <t-button variant="text" class="gap-3 hover:bg-gray-500/10" @click="handleClear">
            <template #icon>
              <t-icon name="delete" size="14" />
            </template>
            {{ $t('views.chat.clearList') }}
          </t-button>
        </div>
      </div>
    </div>
    <div class="flex-1"><Chatbox v-model:chat-list-visable="chatListVisable" /></div>
  </div>
</template>
