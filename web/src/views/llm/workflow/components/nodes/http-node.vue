<template>
  <div class="relative cursor-pointer node-container" :class="{ selected: selected }">
    <div
      class="bg-white border-2 border-cyan-500 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      style="min-width: 250px"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 bg-cyan-500 text-white rounded-t-md">
        <div class="flex items-center">
          <t-icon name="internet" class="mr-2" />
          <span class="font-medium">{{ data.label }}</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-3">
        <div class="input-field">
          <label class="text-xs text-gray-500 mb-1 block">请求方法</label>
          <t-select v-model="config.method" size="small">
            <t-option value="GET" label="GET" />
            <t-option value="POST" label="POST" />
            <t-option value="PUT" label="PUT" />
            <t-option value="DELETE" label="DELETE" />
            <t-option value="PATCH" label="PATCH" />
          </t-select>
        </div>
        <div class="input-field mt-2">
          <label class="text-xs text-gray-500 mb-1 block">请求URL</label>
          <t-input v-model="config.url" size="small" placeholder="https://api.example.com" />
        </div>
        <div class="input-field mt-2">
          <label class="text-xs text-gray-500 mb-1 block">请求头</label>
          <t-textarea v-model="headersText" size="small" :rows="2" placeholder='{"Content-Type": "application/json"}' />
        </div>
        <div class="input-field mt-2" v-if="config.method !== 'GET'">
          <label class="text-xs text-gray-500 mb-1 block">请求体</label>
          <t-textarea v-model="config.body" size="small" :rows="2" placeholder="请求体内容" />
        </div>
      </div>
    </div>

    <!-- 左侧连接点 -->
    <div class="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Handle
        type="target"
        :position="Position.Left"
        class="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 -->
    <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
      <Handle
        type="source"
        :position="Position.Right"
        class="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Handle, Position, useVueFlow } from '@vue-flow/core';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    id: string;
    selected: boolean;
    data: NodeData;
  }>();

  // 获取Vue Flow实例
  const { findNode } = useVueFlow();

  // 计算当前节点是否被选中
  const selected = computed(() => props.selected);

  const config = computed(() => props.data.config || {});

  const headersText = computed({
    get: () => {
      return config.value.headers ? JSON.stringify(config.value.headers, null, 2) : '';
    },
    set: (value: string) => {
      try {
        config.value.headers = JSON.parse(value);
      } catch (e) {
        // 忽略JSON解析错误
      }
    },
  });
</script>

<style scoped>
  /* 悬停时显示图标 */
  .node-container:hover .opacity-0 {
    opacity: 1;
  }

  /* 悬停时放大连接点 */
  .node-container:hover .w-3 {
    width: 1rem;
  }

  .node-container:hover .h-3 {
    height: 1rem;
  }

  /* 选中状态样式 */
  .node-container.selected > div {
    box-shadow: 0 0 0 2px rgb(59 130 246);
  }

  .node-container.selected .opacity-0 {
    opacity: 1;
  }

  .node-container.selected .w-3 {
    width: 1rem;
  }

  .node-container.selected .h-3 {
    height: 1rem;
  }
</style>
