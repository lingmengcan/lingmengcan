<template>
  <div class="relative cursor-pointer node-container">
    <div
      class="relative rounded-lg border-2 border-blue-500 bg-white shadow-md min-w-[300px] hover:shadow-lg transition-all duration-200"
    >
      <!-- 节点头部 -->
      <div class="flex items-center justify-between px-4 py-2 bg-white rounded-t-lg border-b border-gray-200">
        <div class="flex items-center">
          <t-icon name="fork" class="text-blue-600 mr-2" />
          <span class="font-medium text-gray-800">{{ data.label }}</span>
        </div>
        <div class="flex items-center">
          <t-icon name="more" class="text-gray-500" />
        </div>
      </div>

      <!-- 节点内容 -->
      <div class="p-3">
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">条件分支</span>
          <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium">condition</span>
        </div>
      </div>
    </div>

    <!-- IF 连接点 -->
    <div class="absolute right-0 top-1/3 transform translate-x-1/2 -translate-y-1/2 flex items-center">
      <div class="mr-2 text-xs font-medium text-gray-600">IF</div>
      <Handle
        type="source"
        :position="Position.Right"
        id="true"
        class="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- ELSE 连接点 -->
    <div class="absolute right-0 top-2/3 transform translate-x-1/2 -translate-y-1/2 flex items-center">
      <div class="mr-2 text-xs font-medium text-gray-600">ELSE</div>
      <Handle
        type="source"
        :position="Position.Right"
        id="false"
        class="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
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
  const {} = useVueFlow();
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
