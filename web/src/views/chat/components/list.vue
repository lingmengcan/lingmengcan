<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { useChatStore } from '@/store/modules/chat';
  import { Conversation } from '@/models/chat';

  const chatStore = useChatStore();

  const conversationList = computed(() => {
    const list = chatStore.conversationList;
    return list;
  });

  async function handleSelect({ conversationId }: Conversation) {
    if (isActive(conversationId)) return;

    await chatStore.setActive(conversationId);
  }

  function handleEdit(item: Conversation, isEdit: boolean, event?: MouseEvent) {
    event?.stopPropagation();
    item.isEdit = isEdit;
    if (!isEdit) {
      chatStore.updateConversation(item);
    }
  }

  function handleDelete(item: Conversation, event?: MouseEvent) {
    event?.stopPropagation();
    chatStore.deleteConversation(item);
  }

  function isActive(conversationId: string | undefined) {
    return chatStore.activeId === conversationId;
  }

  onMounted(async () => {
    chatStore.setConversationList();
  });
</script>

<template>
  <div class="overflow-y-auto">
    <div class="mt-4">
      <div class="flex flex-col w-full gap-2">
        <div v-for="(item, index) of conversationList" :key="index">
          <t-input v-if="item.isEdit" v-model="item.conversationName" class="items-center w-full h-9">
            <template #suffix-icon>
              <t-icon
                name="check"
                class="ml-2 text-blue-800 cursor-pointer hover:text-gray-500"
                @click="handleEdit(item, false, $event)"
              />

              <t-icon
                name="close"
                class="text-blue-800 cursor-pointer hover:text-gray-500"
                @click="item.isEdit = false"
              />
            </template>
          </t-input>
          <t-button
            v-else
            :variant="isActive(item.conversationId) ? 'outline' : 'text'"
            class="w-full! h-9! justify-start!"
            :class="isActive(item.conversationId) && ['bg-sky-200!']"
            @click="handleSelect(item)"
          >
            <div
              class="text-[12.5px] truncate"
              :class="isActive(item.conversationId) && ['w-40', 'text-left']"
              :title="item.conversationName"
            >
              {{ item.conversationName }}
            </div>

            <div v-if="isActive(item.conversationId)" class="flex ml-2">
              <t-icon
                name="edit"
                class="mr-1 text-blue-800 cursor-pointer hover:text-gray-500"
                @click="handleEdit(item, true, $event)"
              />

              <t-popconfirm placement="top" :content="$t('common.deleteConfirm')" @confirm="handleDelete(item, $event)">
                <t-icon name="delete" class="text-blue-800 cursor-pointer hover:text-gray-500" />
              </t-popconfirm>
            </div>
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>
