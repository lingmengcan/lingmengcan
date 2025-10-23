<template>
  <div class="relative cursor-pointer node-container">
    <!-- 节点主体 -->
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="login" class="text-sm text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ props.data.label }}</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="px-3 py-2">
        <div v-if="inputs.length > 0" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输入</span>
          <div class="flex items-center gap-1 flex-wrap">
            <span
              v-for="(input, index) in inputs"
              :key="`input-${index}`"
              class="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"
            >
              {{ input.name }}
            </span>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400">
          暂无输入变量
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
  import { Handle, Position } from '@vue-flow/core';
  import { computed } from 'vue';

  interface InputVariable {
    name: string;
    type: string;
  }

  interface NodeData {
    label: string;
    config: {
      inputs?: InputVariable[];
    };
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  // 计算输入变量列表 - 直接使用 props.data 保持响应式
  const inputs = computed(() => {
    if (Array.isArray(props.data.config?.inputs) && props.data.config.inputs.length > 0) {
      return props.data.config.inputs;
    }
    // 默认显示一个输入变量
    return [{ name: 'input', type: 'text' }];
  });
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
