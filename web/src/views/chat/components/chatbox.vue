<template>
  <t-chat :clear-history="false" :reverse="true" :text-loading="loading">
    <!-- eslint-disable vue/no-unused-vars -->
    <template #name="{ item, index }">
      {{ item.name }}
    </template>
    <template #avatar="{ item, index }">
      <n-avatar size="large" shape="circle" :image="item.avatar" />
    </template>
    <template #datetime="{ item, index }">
      {{ item.datetime }}
    </template>
    <template #content="{ item, index }">
      <t-chat-content :content="item.content" />
    </template>
    <template #actions="{ item, index }">
      <t-chat-action :content="item.content" :operation-btn="['good', 'bad', 'replay', 'copy']" />
    </template>
    <template #footer>
      <t-chat-sender
        ref="chatSenderRef"
        :stop-disabled="loading"
        :textarea-props="{
          placeholder: '发消息、输入 @ 或 / 选择技能',
        }"
        @send="inputEnter"
      >
        <template #prefix>
          <div class="model-select">
            <!-- <n-tooltip v-model:visible="allowToolTip" content="切换模型" trigger="hover">
              <n-select
                v-model="selectValue"
                :options="selectOptions"
                value-type="object"
                @focus="allowToolTip = false"
              ></n-select>
            </n-tooltip>
            <n-button class="check-box" :class="{ 'is-active': isChecked }" variant="text" @click="checkClick">
              <SystemSumIcon />
              <span>深度思考</span>
            </n-button> -->
          </div>
        </template>
      </t-chat-sender>
    </template>
  </t-chat>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import {
    Chat as TChat,
    ChatAction as TChatAction,
    ChatContent as TChatContent,
    ChatSender as TChatSender,
    ChatItem as TChatItem,
    ChatLoading as TChatLoading,
    ChatReasoning as TChatReasoning,
  } from '@tdesign-vue-next/chat';

  const loading = ref(false);
  const isStreamLoad = ref(false);
  const allowToolTip = ref(false);
  const chatSenderRef = ref(null);

  const handleStop = function () {
    isStreamLoad.value = false;
  };
  // 模拟消息发送
  const inputEnter = function (inputValue: string) {
    if (isStreamLoad.value) {
      return;
    }
    if (!inputValue) return;
    isStreamLoad.value = true;
    loading.value = true;
    // 模拟接口请求响应中
    setTimeout(() => {
      loading.value = false;
    }, 1000);
    //   模拟流式数据加载中
    setTimeout(() => {
      isStreamLoad.value = false;
    }, 1000);
  };
</script>
