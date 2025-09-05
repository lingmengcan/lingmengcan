<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-lg">
        <div class="flex items-center">
          <t-icon name="login" class="text-sm text-gray-700 mr-1.5" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>
      <div class="px-3 py-2 border-t border-gray-100">
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">输入</span>
          <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium">input</span>
        </div>
      </div>
    </div>

    <!-- 连接点 -->
    <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
      <Handle
        type="source"
        :position="Position.Right"
        class="handle-point bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position, useVueFlow } from '@vue-flow/core';
  import { ref } from 'vue';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  const data = ref(props.data);

  // 获取Vue Flow实例
  const { findNode } = useVueFlow();
</script>

<style scoped>
  /* 悬停时显示图标和放大连接点 */
  .node-container:hover .handle-icon {
    opacity: 1;
  }

  .node-container .handle-point {
    width: 12px;
    height: 12px;
  }

  .node-container:hover .handle-point {
    width: 16px;
    height: 16px;
  }
</style>
