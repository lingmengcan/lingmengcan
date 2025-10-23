<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-lg">
        <div class="flex items-center">
          <t-icon name="logout" class="text-sm text-blue-600 mr-1.5" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>
      <!-- 内容区域 -->
      <div class="px-3 py-2 border-t border-gray-100">
        <div v-if="outputs.length > 0" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输出</span>
          <div class="flex items-center gap-1 flex-wrap">
            <span
              v-for="(output, index) in outputs"
              :key="`output-${index}`"
              class="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded"
            >
              {{ output.name }}
            </span>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400">
          暂无输出变量
        </div>
      </div>
    </div>

    <!-- 连接点 -->
    <div class="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Handle
        type="target"
        :position="Position.Left"
        class="handle-point w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core';
  import { computed } from 'vue';

  interface OutputVariable {
    name: string;
    type: string;
  }

  interface NodeData {
    label: string;
    config: {
      outputs?: OutputVariable[];
    };
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  const data = props.data;

  // 计算输出变量列表 - 直接使用 props.data 保持响应式
  const outputs = computed(() => {
    if (Array.isArray(props.data.config?.outputs) && props.data.config.outputs.length > 0) {
      return props.data.config.outputs;
    }
    // 默认显示一个输出变量
    return [{ name: 'output', type: 'json' }];
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
