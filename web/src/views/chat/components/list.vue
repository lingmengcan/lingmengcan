<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { useChatStore } from '@/store/modules/chat';
  import { Conversation } from '@/models/chat';
  import { CheckIcon, CloseIcon, DeleteIcon, EditIcon } from 'tdesign-icons-vue-next';

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
  <n-scrollbar>
    <div class="mt-4">
      <div class="flex flex-col w-full gap-2">
        <div v-for="(item, index) of conversationList" :key="index">
          <n-input v-if="item.isEdit" v-model:value="item.conversationName" class="items-center w-full h-9">
            <template #suffix>
              <n-icon
                class="ml-2 text-blue-800 cursor-pointer hover:text-gray-500"
                @click="handleEdit(item, false, $event)"
              >
                <CheckIcon />
              </n-icon>

              <n-icon class="text-blue-800 cursor-pointer hover:text-gray-500" @click="item.isEdit = false">
                <CloseIcon />
              </n-icon>
            </template>
          </n-input>
          <n-button
            v-else
            :bordered="isActive(item.conversationId)"
            class="!w-full !h-9 !justify-start"
            :class="isActive(item.conversationId) && ['!bg-sky-200']"
            @click="handleSelect(item)"
          >
            <n-ellipsis
              :tooltip="false"
              class="text-[12.5px]"
              :class="isActive(item.conversationId) && ['w-40', 'text-left']"
            >
              {{ item.conversationName }}
            </n-ellipsis>

            <div v-if="isActive(item.conversationId)" class="flex ml-2">
              <n-icon
                class="mr-1 text-blue-800 cursor-pointer hover:text-gray-500"
                @click="handleEdit(item, true, $event)"
              >
                <EditIcon />
              </n-icon>

              <n-popconfirm placement="top" @positive-click="handleDelete(item, $event)">
                <template #trigger>
                  <n-icon class="text-blue-800 cursor-pointer hover:text-gray-500">
                    <DeleteIcon />
                  </n-icon>
                </template>
                {{ $t('common.deleteConfirm') }}
              </n-popconfirm>
            </div>
          </n-button>
        </div>
      </div>
    </div>
  </n-scrollbar>
</template>
